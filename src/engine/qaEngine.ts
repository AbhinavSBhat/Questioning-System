import {
  EngineVersion,
  ParsedKnowledgeBase,
  QAResult,
  RuleEvaluationTrace,
  TraceStep,
} from '../types/qa';

export function parseScholarshipDocument(
  documentText: string,
  version: EngineVersion
): ParsedKnowledgeBase {
  const textualFacts: Record<string, string> = {};
  const numericFacts: Record<string, number> = {};
  const parsedLines: ParsedKnowledgeBase['parsedLines'] = [];

  const lines = documentText.split(/\r?\n/);
  lines.forEach((rawLine, index) => {
    const trimmed = rawLine.trim();
    if (!trimmed || !trimmed.includes(':')) {
      return;
    }

    const colonIdx = trimmed.indexOf(':');
    const rawTopic = trimmed.slice(0, colonIdx).trim();
    const rawValue = trimmed.slice(colonIdx + 1).trim();
    const topicKey = rawTopic.toLowerCase();

    textualFacts[topicKey] = rawValue;

    let numericKey: string | undefined;
    let numericValue: number | undefined;
    let commaWarning = false;

    const isPrimaryNumericTopic =
      topicKey === 'income limit' ||
      topicKey === 'minimum marks' ||
      /^\d[\d,]*$/.test(rawValue);

    if (isPrimaryNumericTopic) {
      const candidateKey = topicKey.replace(/\s+/g, '_');

      if (version === 'original') {
        // Fault 5: Original version failed on comma-formatted numbers like "250,000"
        if (/^\d+$/.test(rawValue)) {
          numericKey = candidateKey;
          numericValue = parseInt(rawValue, 10);
          numericFacts[candidateKey] = numericValue;
        } else if (/,/.test(rawValue)) {
          commaWarning = true;
        }
      } else {
        // Final version strips commas before scanning integers
        const cleaned = rawValue.replace(/,/g, '');
        const match = cleaned.match(/\d+/);
        if (match) {
          numericKey = candidateKey;
          numericValue = parseInt(match[0], 10);
          numericFacts[candidateKey] = numericValue;
        }
      }
    }

    parsedLines.push({
      lineNumber: index + 1,
      rawLine: trimmed,
      topicKey,
      value: rawValue,
      numericKey,
      numericValue,
      commaWarning,
    });
  });

  return {
    textualFacts,
    numericFacts,
    parsedLines,
  };
}

function extractNumbers(question: string, version: EngineVersion): number[] {
  const source = version === 'original' ? question : question.replace(/,/g, '');
  const matches = source.match(/\d+/g);
  if (!matches) return [];
  return matches.map((n) => parseInt(n, 10));
}

function matchesKeywordGroups(
  textToSearch: string,
  groups: string[][],
  caseSensitive = false
): { matched: boolean; matchedTerms: string[]; missingGroups: string[] } {
  const target = caseSensitive ? textToSearch : textToSearch.toLowerCase();
  const matchedTerms: string[] = [];
  const missingGroups: string[] = [];

  for (const group of groups) {
    const found = group.find((kw) =>
      target.includes(caseSensitive ? kw : kw.toLowerCase())
    );
    if (found) {
      matchedTerms.push(found);
    } else {
      missingGroups.push(group.join(' / '));
    }
  }

  return {
    matched: missingGroups.length === 0,
    matchedTerms,
    missingGroups,
  };
}

export function evaluateQuestion(
  question: string,
  kb: ParsedKnowledgeBase,
  version: EngineVersion
): QAResult {
  const start = performance.now();
  const trimmedQuestion = question.trim();
  const normalizedQuestion = trimmedQuestion.toLowerCase();
  const extractedNumbers = extractNumbers(normalizedQuestion, version);
  const ruleChecks: RuleEvaluationTrace[] = [];

  const incomeLimit = kb.numericFacts['income_limit'];
  const minMarks = kb.numericFacts['minimum_marks'];

  let matchedRuleId: string | null = null;
  let matchedRuleName: string | null = null;
  let outcome: QAResult['outcome'] = 'unavailable';
  let answer = 'Information unavailable for this question.';
  let shortAnswer = 'Information unavailable';
  let explanation = 'No domain rule matched the question keywords.';
  let faultTriggered: string | undefined;

  const evalRule = (
    ruleId: string,
    ruleName: string,
    priority: number,
    triggerGroupsLabel: string,
    groups: string[][],
    options?: { caseSensitive?: boolean; searchRaw?: boolean }
  ): boolean => {
    if (matchedRuleId !== null) {
      ruleChecks.push({
        ruleId,
        ruleName,
        priority,
        triggerGroupsLabel,
        matched: false,
        reason: `Skipped because higher-priority rule ${matchedRuleId} already fired.`,
      });
      return false;
    }

    const searchInput = options?.searchRaw ? trimmedQuestion : normalizedQuestion;
    const res = matchesKeywordGroups(searchInput, groups, options?.caseSensitive);
    if (res.matched) {
      ruleChecks.push({
        ruleId,
        ruleName,
        priority,
        triggerGroupsLabel,
        matched: true,
        reason: `Matched trigger keywords: ${res.matchedTerms.map((t) => `"${t}"`).join(', ')}.`,
      });
      return true;
    }

    ruleChecks.push({
      ruleId,
      ruleName,
      priority,
      triggerGroupsLabel,
      matched: false,
      reason: `Missing required keyword group: {${res.missingGroups.join('}, {')}}.`,
    });
    return false;
  };

  // R1: Income limit (Fault 4 in Original version: case-sensitive check on lowercase keywords)
  if (
    evalRule(
      'R1',
      'Income limit',
      1,
      '{income, limit}',
      [['income'], ['limit']],
      version === 'original' ? { caseSensitive: true, searchRaw: true } : undefined
    )
  ) {
    matchedRuleId = 'R1';
    matchedRuleName = 'Income limit';
    if (incomeLimit !== undefined) {
      outcome = 'factual';
      answer = `The income limit is ${incomeLimit}.`;
      shortAnswer = String(incomeLimit);
      explanation = `Retrieved numeric fact income_limit = ${incomeLimit} from Knowledge Base.`;
    } else if (kb.textualFacts['income limit']) {
      outcome = 'error';
      answer = `Numeric fact "income_limit" was not parsed from "${kb.textualFacts['income limit']}".`;
      shortAnswer = 'Parse error';
      explanation = 'Fault 5 triggered: comma-formatted value could not be stored as an integer.';
      faultTriggered = 'Fault 5: Comma-formatted number failed integer parsing.';
    } else {
      outcome = 'unavailable';
      answer = 'Income limit is not defined in the loaded document.';
      shortAnswer = 'Not found';
      explanation = 'Document does not contain an Income Limit entry.';
    }
  } else if (
    version === 'original' &&
    matchesKeywordGroups(normalizedQuestion, [['income'], ['limit']]).matched
  ) {
    faultTriggered =
      'Fault 4: Case-sensitive keyword matching failed because of uppercase letters.';
  }

  // R2: Income eligibility (Fault 2 in Original version: only "eligible", missing "apply"/"qualify")
  const r2Triggers =
    version === 'original'
      ? [['income'], ['eligible']]
      : [['income'], ['eligible', 'apply', 'qualify']];
  const r2Label =
    version === 'original'
      ? '{income}, {eligible}'
      : '{income}, {eligible / apply / qualify}';

  if (evalRule('R2', 'Income eligibility', 2, r2Label, r2Triggers)) {
    matchedRuleId = 'R2';
    matchedRuleName = 'Income eligibility';

    if (incomeLimit === undefined) {
      outcome = 'error';
      answer = 'Cannot infer income eligibility because numeric fact income_limit is missing.';
      shortAnswer = 'Parse error';
      explanation =
        'Fault 5 triggered: income_limit was not parsed into numeric facts (e.g., due to comma formatting).';
      faultTriggered = 'Fault 5: income_limit unavailable in numeric facts.';
    } else if (extractedNumbers.length === 0) {
      outcome = 'unavailable';
      answer = `Please include your family income amount to compare against the limit of ${incomeLimit}.`;
      shortAnswer = 'Number required';
      explanation = 'Rule R2 matched, but re.findall(r"\\d+", question) extracted no numbers.';
    } else {
      const applicantIncome = extractedNumbers[0];
      if (applicantIncome <= incomeLimit) {
        outcome = 'eligible';
        answer = `Yes, your income ${applicantIncome} is within the limit of ${incomeLimit}. You are eligible to apply.`;
        shortAnswer = 'Yes, within limit';
        explanation = `Numeric inference: ${applicantIncome} <= ${incomeLimit} evaluates to True.`;
      } else {
        outcome = 'ineligible';
        answer = `No, your income ${applicantIncome} exceeds the limit of ${incomeLimit}. You are not eligible.`;
        shortAnswer = 'No, exceeds limit';
        explanation = `Numeric inference: ${applicantIncome} <= ${incomeLimit} evaluates to False.`;
      }
    }
  } else if (
    version === 'original' &&
    matchedRuleId === null &&
    matchesKeywordGroups(normalizedQuestion, [['income'], ['eligible', 'apply', 'qualify']]).matched
  ) {
    faultTriggered =
      'Fault 2: Original R2 only checked "eligible" and missed "apply" / "qualify".';
  }

  // R3: Minimum marks
  if (
    evalRule('R3', 'Minimum marks', 3, '{marks, minimum / requirement}', [
      ['marks'],
      ['minimum', 'requirement'],
    ])
  ) {
    matchedRuleId = 'R3';
    matchedRuleName = 'Minimum marks';
    if (minMarks !== undefined) {
      outcome = 'factual';
      answer = `The minimum marks requirement is ${minMarks}.`;
      shortAnswer = String(minMarks);
      explanation = `Retrieved numeric fact minimum_marks = ${minMarks} from Knowledge Base.`;
    } else {
      outcome = 'unavailable';
      answer = 'Minimum marks requirement is not defined in the document.';
      shortAnswer = 'Not found';
      explanation = 'Document does not contain a Minimum Marks entry.';
    }
  }

  // R4: Marks eligibility (Fault 3 in Original version: strict m > 75 instead of m >= 75)
  if (
    evalRule('R4', 'Marks eligibility', 4, '{marks}, {qualify / eligible}', [
      ['marks'],
      ['qualify', 'eligible', 'apply'],
    ])
  ) {
    matchedRuleId = 'R4';
    matchedRuleName = 'Marks eligibility';

    if (minMarks === undefined) {
      outcome = 'error';
      answer = 'Cannot infer marks eligibility because minimum_marks is missing.';
      shortAnswer = 'Parse error';
      explanation = 'Numeric fact minimum_marks is absent from the parsed Knowledge Base.';
    } else if (extractedNumbers.length === 0) {
      outcome = 'unavailable';
      answer = `Please include your marks to compare against the minimum requirement of ${minMarks}.`;
      shortAnswer = 'Number required';
      explanation = 'Rule R4 matched, but no integer was extracted from the question.';
    } else {
      const applicantMarks = extractedNumbers[0];
      const passed =
        version === 'original'
          ? applicantMarks > minMarks // Fault 3: strict >
          : applicantMarks >= minMarks; // Fixed: >=

      if (passed) {
        outcome = 'eligible';
        answer = `Yes, your marks ${applicantMarks} meet the minimum requirement of ${minMarks}. You qualify.`;
        shortAnswer = 'Yes, above minimum';
        explanation =
          version === 'original'
            ? `Numeric inference (Original): ${applicantMarks} > ${minMarks} evaluates to True.`
            : `Numeric inference: ${applicantMarks} >= ${minMarks} evaluates to True.`;
      } else {
        outcome = 'ineligible';
        if (version === 'original' && applicantMarks === minMarks) {
          faultTriggered =
            'Fault 3: Strict greater-than (m > 75) wrongly rejected boundary value 75.';
          answer = `No, your marks ${applicantMarks} did not exceed ${minMarks} (strict > check in Original engine).`;
          shortAnswer = 'No, strict > failed boundary';
          explanation = `Fault 3 triggered: ${applicantMarks} > ${minMarks} evaluated to False.`;
        } else {
          answer = `No, your marks ${applicantMarks} are below the minimum requirement of ${minMarks}. You do not qualify.`;
          shortAnswer = 'No, below minimum';
          explanation = `Numeric inference: ${applicantMarks} >= ${minMarks} evaluates to False.`;
        }
      }
    }
  }

  // R5: Deadline
  if (evalRule('R5', 'Deadline', 5, '{deadline, when}', [['deadline']])) {
    matchedRuleId = 'R5';
    matchedRuleName = 'Deadline';
    const deadlineFact = kb.textualFacts['application deadline'] ?? kb.textualFacts['deadline'];
    if (deadlineFact) {
      outcome = 'factual';
      answer = `The application deadline is ${deadlineFact}.`;
      shortAnswer = deadlineFact;
      explanation = 'Retrieved textual fact "application deadline" from Fact Base.';
    } else {
      outcome = 'unavailable';
      answer = 'Application deadline is not specified in the loaded document.';
      shortAnswer = 'Not found';
      explanation = 'Fact Base does not contain "application deadline".';
    }
  }

  // R6: Documents
  if (
    evalRule('R6', 'Documents', 6, '{documents, required}', [
      ['document'],
      ['required', 'need', 'submit', 'what', 'list'],
    ])
  ) {
    matchedRuleId = 'R6';
    matchedRuleName = 'Documents';
    const docsFact = kb.textualFacts['required documents'] ?? kb.textualFacts['documents'];
    if (docsFact) {
      outcome = 'factual';
      answer = `Required documents: ${docsFact}.`;
      shortAnswer = docsFact;
      explanation = 'Retrieved textual fact "required documents" from Fact Base.';
    } else {
      outcome = 'unavailable';
      answer = 'Required documents are not specified in the loaded document.';
      shortAnswer = 'Not found';
      explanation = 'Fact Base does not contain "required documents".';
    }
  }

  // R7: Renewal
  if (
    evalRule('R7', 'Renewal', 7, '{renew, criteria / how}', [
      ['renew'],
      ['criteria', 'how', 'condition', 'rule'],
    ])
  ) {
    matchedRuleId = 'R7';
    matchedRuleName = 'Renewal';
    const renewFact = kb.textualFacts['renewal criteria'] ?? kb.textualFacts['renewal'];
    if (renewFact) {
      outcome = 'factual';
      answer = `Renewal criteria: ${renewFact}.`;
      shortAnswer = renewFact;
      explanation = 'Retrieved textual fact "renewal criteria" from Fact Base.';
    } else {
      outcome = 'unavailable';
      answer = 'Renewal criteria are not specified in the loaded document.';
      shortAnswer = 'Not found';
      explanation = 'Fact Base does not contain "renewal criteria".';
    }
  }

  // R8: Contact
  if (evalRule('R8', 'Contact', 8, '{contact}', [['contact']])) {
    matchedRuleId = 'R8';
    matchedRuleName = 'Contact';
    const contactFact = kb.textualFacts['contact'];
    if (contactFact) {
      outcome = 'factual';
      answer = `You can contact: ${contactFact}.`;
      shortAnswer = contactFact;
      explanation = 'Retrieved textual fact "contact" from Fact Base.';
    } else {
      outcome = 'unavailable';
      answer = 'Contact information is not specified in the loaded document.';
      shortAnswer = 'Not found';
      explanation = 'Fact Base does not contain "contact".';
    }
  }

  // R9: Fallback (Fault 1 in Original version: No fallback rule, returns None)
  if (matchedRuleId === null) {
    if (version === 'original') {
      ruleChecks.push({
        ruleId: 'R9',
        ruleName: 'Fallback (Missing in v1)',
        priority: 9,
        triggerGroupsLabel: 'No fallback rule',
        matched: false,
        reason: 'Fault 1: Original version lacked a fallback rule and returned None.',
      });
      outcome = 'error';
      answer = 'None (Unhandled query — Original engine lacked a fallback rule).';
      shortAnswer = 'None';
      explanation = faultTriggered
        ? faultTriggered
        : 'Fault 1 triggered: No rule matched and no fallback rule was defined.';
      if (!faultTriggered) {
        faultTriggered = 'Fault 1: Engine returned None instead of "Information unavailable".';
      }
    } else {
      ruleChecks.push({
        ruleId: 'R9',
        ruleName: 'Fallback',
        priority: 9,
        triggerGroupsLabel: '(always matches)',
        matched: true,
        reason: 'No domain rule R1–R8 matched; R9 fallback rule fired.',
      });
      matchedRuleId = 'R9';
      matchedRuleName = 'Fallback';
      outcome = 'unavailable';
      answer = 'Information unavailable for this question.';
      shortAnswer = 'Information unavailable';
      explanation = 'Graceful fallback triggered because no domain rule matched the question.';
    }
  } else {
    ruleChecks.push({
      ruleId: 'R9',
      ruleName: 'Fallback',
      priority: 9,
      triggerGroupsLabel: '(always matches)',
      matched: false,
      reason: `Skipped because higher-priority rule ${matchedRuleId} already fired.`,
    });
  }

  const end = performance.now();
  const latencyMs = Math.max(0.05, Number((end - start).toFixed(2)));

  const steps: TraceStep[] = [
    {
      stepNumber: 1,
      title: 'Knowledge Base Load',
      detail: `${Object.keys(kb.textualFacts).length} textual facts and ${Object.keys(kb.numericFacts).length} numeric thresholds active.`,
      status: Object.keys(kb.numericFacts).length < 2 && version === 'original' ? 'fault' : 'complete',
    },
    {
      stepNumber: 2,
      title: 'Question Processing',
      detail: `Normalized: "${normalizedQuestion}" · Extracted numbers: [${
        extractedNumbers.length > 0 ? extractedNumbers.join(', ') : 'none'
      }]`,
      status: 'complete',
    },
    {
      stepNumber: 3,
      title: 'Priority Rule Scan',
      detail: matchedRuleId
        ? `Linear scan stopped at ${matchedRuleId} (${matchedRuleName}).`
        : 'Linear scan completed R1–R8 with zero matches.',
      status: matchedRuleId === 'R9' ? 'fallback' : matchedRuleId ? 'matched' : 'fault',
    },
    {
      stepNumber: 4,
      title: 'Inference & Fact Lookup',
      detail: explanation,
      status: outcome === 'error' ? 'fault' : matchedRuleId === 'R9' ? 'fallback' : 'complete',
    },
    {
      stepNumber: 5,
      title: 'Answer Generation',
      detail: answer,
      status: outcome === 'error' ? 'fault' : matchedRuleId === 'R9' ? 'fallback' : 'complete',
    },
  ];

  return {
    question: trimmedQuestion,
    normalizedQuestion,
    extractedNumbers,
    matchedRuleId,
    matchedRuleName,
    outcome,
    answer,
    shortAnswer,
    explanation,
    latencyMs,
    ruleChecks,
    steps,
    faultTriggered,
  };
}
