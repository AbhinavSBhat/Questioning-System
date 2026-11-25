export type EngineVersion = 'final' | 'original';

export type NavSection =
  | 'ask'
  | 'knowledge-base'
  | 'rule-engine'
  | 'evaluation';

export type AnswerOutcome = 'factual' | 'eligible' | 'ineligible' | 'unavailable' | 'error';

export interface ParsedKnowledgeBase {
  textualFacts: Record<string, string>;
  numericFacts: Record<string, number>;
  parsedLines: Array<{
    lineNumber: number;
    rawLine: string;
    topicKey: string;
    value: string;
    numericKey?: string;
    numericValue?: number;
    commaWarning?: boolean;
  }>;
}

export interface RuleEvaluationTrace {
  ruleId: string;
  ruleName: string;
  priority: number;
  triggerGroupsLabel: string;
  matched: boolean;
  reason: string;
}

export interface TraceStep {
  stepNumber: number;
  title: string;
  detail: string;
  status: 'complete' | 'matched' | 'skipped' | 'fallback' | 'fault';
}

export interface QAResult {
  question: string;
  normalizedQuestion: string;
  extractedNumbers: number[];
  matchedRuleId: string | null;
  matchedRuleName: string | null;
  outcome: AnswerOutcome;
  answer: string;
  shortAnswer: string;
  explanation: string;
  latencyMs: number;
  ruleChecks: RuleEvaluationTrace[];
  steps: TraceStep[];
  faultTriggered?: string;
}

export interface RuleDefinition {
  id: string;
  name: string;
  priority: number;
  triggerGroups: string[][];
  triggerDisplay: string;
  conditionAction: string;
  type: 'Factual' | 'Inferential' | 'Fallback';
}

export interface BenchmarkQuestion {
  id: number;
  question: string;
  type: 'Factual' | 'Inferential' | 'Unsupported';
  expectedShort: string;
  expectedRuleId: string;
  matcher: (result: QAResult) => boolean;
}

export interface FaultRecord {
  id: string;
  title: string;
  impactedCase: string;
  originalBehavior: string;
  fixedBehavior: string;
  testQuery: string;
}
