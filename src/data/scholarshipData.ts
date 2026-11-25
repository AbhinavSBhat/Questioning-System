import { BenchmarkQuestion, FaultRecord, RuleDefinition } from '../types/qa';

export const DEFAULT_SCHOLARSHIP_TEXT = `Scholarship Name: Merit-cum-Means Scholarship
Income Limit: 250000
Minimum Marks: 75
Application Deadline: 31 August 2026
Required Documents: Income certificate, marksheets, bank passbook
Renewal Criteria: Maintain 70 percent marks and no disciplinary action
Disbursement: Amount is credited to the student bank account in two installments
Contact: scholarship@college.edu`;

export const COMMA_TEST_SCHOLARSHIP_TEXT = `Scholarship Name: Merit-cum-Means Scholarship
Income Limit: 250,000
Minimum Marks: 75
Application Deadline: 31 August 2026
Required Documents: Income certificate, marksheets, bank passbook
Renewal Criteria: Maintain 70 percent marks and no disciplinary action
Disbursement: Amount is credited to the student bank account in two installments
Contact: scholarship@college.edu`;

export const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    id: 'R1',
    name: 'Income limit',
    priority: 1,
    triggerGroups: [['income'], ['limit']],
    triggerDisplay: '{income, limit}',
    conditionAction: 'Retrieve numeric fact income_limit = 250000',
    type: 'Factual',
  },
  {
    id: 'R2',
    name: 'Income eligibility',
    priority: 2,
    triggerGroups: [['income'], ['eligible', 'apply', 'qualify']],
    triggerDisplay: '{income}, {eligible / apply / qualify}',
    conditionAction: 'Extract number n; answer Yes if n <= income_limit else No, with explanation',
    type: 'Inferential',
  },
  {
    id: 'R3',
    name: 'Minimum marks',
    priority: 3,
    triggerGroups: [['marks'], ['minimum', 'requirement']],
    triggerDisplay: '{marks, minimum / requirement}',
    conditionAction: 'Retrieve numeric fact minimum_marks = 75',
    type: 'Factual',
  },
  {
    id: 'R4',
    name: 'Marks eligibility',
    priority: 4,
    triggerGroups: [['marks'], ['qualify', 'eligible', 'apply']],
    triggerDisplay: '{marks}, {qualify / eligible}',
    conditionAction: 'Extract number m; answer Yes if m >= minimum_marks else No, with explanation',
    type: 'Inferential',
  },
  {
    id: 'R5',
    name: 'Deadline',
    priority: 5,
    triggerGroups: [['deadline']],
    triggerDisplay: '{deadline, when}',
    conditionAction: 'Retrieve textual fact: Application Deadline',
    type: 'Factual',
  },
  {
    id: 'R6',
    name: 'Documents',
    priority: 6,
    triggerGroups: [['document'], ['required', 'need', 'submit', 'what', 'list']],
    triggerDisplay: '{documents, required}',
    conditionAction: 'Retrieve textual fact: Required Documents',
    type: 'Factual',
  },
  {
    id: 'R7',
    name: 'Renewal',
    priority: 7,
    triggerGroups: [['renew'], ['criteria', 'how', 'condition']],
    triggerDisplay: '{renew, criteria / how}',
    conditionAction: 'Retrieve textual fact: Renewal Criteria',
    type: 'Factual',
  },
  {
    id: 'R8',
    name: 'Contact',
    priority: 8,
    triggerGroups: [['contact']],
    triggerDisplay: '{contact}',
    conditionAction: 'Retrieve textual fact: Contact',
    type: 'Factual',
  },
  {
    id: 'R9',
    name: 'Fallback',
    priority: 9,
    triggerGroups: [],
    triggerDisplay: '(always matches)',
    conditionAction: 'Return "Information unavailable for this question."',
    type: 'Fallback',
  },
];

export const BENCHMARK_QUESTIONS: BenchmarkQuestion[] = [
  {
    id: 1,
    question: 'What is the Income Limit?',
    type: 'Factual',
    expectedShort: '250000',
    expectedRuleId: 'R1',
    matcher: (res) => res.matchedRuleId === 'R1' && res.outcome === 'factual' && res.shortAnswer.includes('250000'),
  },
  {
    id: 2,
    question: 'My income is 200000. Am I eligible?',
    type: 'Inferential',
    expectedShort: 'Yes, within limit',
    expectedRuleId: 'R2',
    matcher: (res) => res.matchedRuleId === 'R2' && res.outcome === 'eligible',
  },
  {
    id: 3,
    question: 'My income is 300000. Can I apply?',
    type: 'Inferential',
    expectedShort: 'No, exceeds limit',
    expectedRuleId: 'R2',
    matcher: (res) => res.matchedRuleId === 'R2' && res.outcome === 'ineligible',
  },
  {
    id: 4,
    question: 'What is the minimum marks requirement?',
    type: 'Factual',
    expectedShort: '75',
    expectedRuleId: 'R3',
    matcher: (res) => res.matchedRuleId === 'R3' && res.outcome === 'factual' && res.shortAnswer.includes('75'),
  },
  {
    id: 5,
    question: 'My marks are 80. Do I qualify?',
    type: 'Inferential',
    expectedShort: 'Yes, above minimum',
    expectedRuleId: 'R4',
    matcher: (res) => res.matchedRuleId === 'R4' && res.outcome === 'eligible',
  },
  {
    id: 6,
    question: 'When is the deadline?',
    type: 'Factual',
    expectedShort: '31 August 2026',
    expectedRuleId: 'R5',
    matcher: (res) => res.matchedRuleId === 'R5' && res.outcome === 'factual' && res.shortAnswer.includes('31 August 2026'),
  },
  {
    id: 7,
    question: 'What documents are required?',
    type: 'Factual',
    expectedShort: 'Income certificate, marksheets, bank passbook',
    expectedRuleId: 'R6',
    matcher: (res) => res.matchedRuleId === 'R6' && res.outcome === 'factual' && res.shortAnswer.toLowerCase().includes('income certificate'),
  },
  {
    id: 8,
    question: 'How can I renew the scholarship?',
    type: 'Factual',
    expectedShort: 'Maintain 70 percent marks and no disciplinary action',
    expectedRuleId: 'R7',
    matcher: (res) => res.matchedRuleId === 'R7' && res.outcome === 'factual' && res.shortAnswer.includes('70 percent'),
  },
  {
    id: 9,
    question: 'Who should I contact?',
    type: 'Factual',
    expectedShort: 'scholarship@college.edu',
    expectedRuleId: 'R8',
    matcher: (res) => res.matchedRuleId === 'R8' && res.outcome === 'factual' && res.shortAnswer.includes('scholarship@college.edu'),
  },
  {
    id: 10,
    question: 'What is the hostel fee?',
    type: 'Unsupported',
    expectedShort: 'Information unavailable',
    expectedRuleId: 'R9',
    matcher: (res) => res.matchedRuleId === 'R9' && res.outcome === 'unavailable',
  },
];

export const FAULTS_FOUND: FaultRecord[] = [
  {
    id: 'Fault 1',
    title: 'No fallback rule',
    impactedCase: 'Test Case 10 ("What is the hostel fee?")',
    originalBehavior: 'Questions outside the rule base caused the engine to return None instead of the required unavailable message.',
    fixedBehavior: 'Added Priority 9 Fallback rule (R9) returning "Information unavailable for this question."',
    testQuery: 'What is the hostel fee?',
  },
  {
    id: 'Fault 2',
    title: 'Restricted income eligibility trigger',
    impactedCase: 'Test Case 3 ("My income is 300000. Can I apply?")',
    originalBehavior: 'Rule R2 only matched the keyword "eligible", so phrasing like "Can I apply?" failed to fire.',
    fixedBehavior: 'Expanded R2 trigger group to {eligible / apply / qualify}.',
    testQuery: 'My income is 300000. Can I apply?',
  },
  {
    id: 'Fault 3',
    title: 'Strict marks boundary condition',
    impactedCase: 'Boundary condition (marks = 75)',
    originalBehavior: 'Marks comparison used strict greater-than (m > 75), wrongly rejecting a student with exactly 75 marks.',
    fixedBehavior: 'Corrected threshold check to inclusive >= (m >= 75).',
    testQuery: 'My marks are 75. Do I qualify?',
  },
  {
    id: 'Fault 4',
    title: 'Case-sensitive keyword matching',
    impactedCase: 'Test Case 1 ("What is the Income Limit?")',
    originalBehavior: 'One rule path checked keywords case-sensitively, failing when "Income Limit" was capitalized.',
    fixedBehavior: 'Normalized both user questions and rule trigger keywords to lowercase.',
    testQuery: 'What is the Income Limit?',
  },
  {
    id: 'Fault 5',
    title: 'Comma-formatted numeric parsing',
    impactedCase: 'Document parsing ("Income Limit: 250,000")',
    originalBehavior: 'Only contiguous digits were scanned, so comma-formatted numbers like "250,000" were not stored as numeric facts.',
    fixedBehavior: 'Stripped commas before integer regex extraction in both document parsing and question numbers.',
    testQuery: 'My income is 200,000. Am I eligible?',
  },
];

export const TECHNIQUES_TABLE = [
  {
    technique: 'Structured knowledge representation',
    role: 'Text facts stored in a dictionary; numeric facts stored separately',
  },
  {
    technique: 'Rule-based reasoning',
    role: 'IF–THEN rules select actions based on question keywords',
  },
  {
    technique: 'Pattern-based number extraction',
    role: 'Regular expressions extract numeric values from questions',
  },
  {
    technique: 'Simple inference',
    role: 'Numeric comparison produces eligibility answers',
  },
  {
    technique: 'Information retrieval',
    role: 'Factual answers are retrieved from the fact base',
  },
  {
    technique: 'Priority-ordered rule matching',
    role: 'Rules are evaluated in a fixed order to resolve conflicts',
  },
];

export const QUICK_SAMPLE_QUESTIONS = [
  'What is the Income Limit?',
  'My family income is 200000. Am I eligible?',
  'My income is 300000. Can I apply?',
  'My marks are 75. Do I qualify?',
  'When is the deadline?',
  'What documents are required?',
  'How can I renew the scholarship?',
  'Who should I contact?',
  'What is the hostel fee?',
];

export const REPORT_METADATA = {
  title: 'Rule-Based College Scholarship Document Question Answering System',
  studentName: 'ABHINAV S BHAT',
  registerNo: '25ETAI410006',
  university: 'Ramaiah University of Applied Sciences',
  faculty: 'Faculty of Engineering & Technology',
  department: 'Computer Science and Engineering',
  programme: 'B. Tech. (3rd Semester / 2025)',
  courseCode: 'AID201A',
  courseTitle: 'Artificial Intelligence',
  courseLeader: 'M Tanushri',
  submissionDate: '20th Nov 2026',
  oneDriveUrl: 'https://1drv.ms/w/c/a8c39e2fbf859ca9/IQB4O7F84EGdTLM-55LozH10AURneMN_VHPXtFzN7FmSew4?e=RwNm2B',
  pdfAssetPath: '/assets/aistudio/ABHINAV_AI_ASSIGNMENT_d64165a7.pdf',
};

export const PYTHON_REFERENCE_CODE = `from dataclasses import dataclass
from pathlib import Path
import re
from typing import Callable, Dict, List, Optional, Tuple


@dataclass
class KnowledgeBase:
    textual_facts: Dict[str, str]
    numeric_facts: Dict[str, int]


@dataclass
class Rule:
    name: str
    keyword_groups: List[Tuple[str, ...]]
    handler: Callable[[str, List[int], KnowledgeBase], str]
    priority: int


def load_knowledge_base(file_path: Path) -> KnowledgeBase:
    textual_facts: Dict[str, str] = {}
    numeric_facts: Dict[str, int] = {}

    for raw_line in file_path.read_text(encoding="utf-8").splitlines():
        if ":" not in raw_line:
            continue
        topic, value = raw_line.split(":", 1)
        key = topic.strip().lower()
        val = value.strip()
        textual_facts[key] = val

        # Strip commas before extracting integers (Fix for Fault 5)
        cleaned_val = val.replace(",", "")
        numbers = re.findall(r"\\d+", cleaned_val)
        if key in ("income limit", "minimum marks") and numbers:
            numeric_key = key.replace(" ", "_")
            numeric_facts[numeric_key] = int(numbers[0])

    return KnowledgeBase(textual_facts=textual_facts, numeric_facts=numeric_facts)


def extract_numbers(question: str) -> List[int]:
    cleaned = question.replace(",", "")
    return [int(n) for n in re.findall(r"\\d+", cleaned)]


def matches_rule(question_lower: str, rule: Rule) -> bool:
    for group in rule.keyword_groups:
        if not any(kw.lower() in question_lower for kw in group):
            return False
    return True


def build_rule_base() -> List[Rule]:
    rules = [
        Rule(
            name="R1: Income limit",
            priority=1,
            keyword_groups=[("income",), ("limit",)],
            handler=lambda q, nums, kb: f"The income limit is {kb.numeric_facts['income_limit']}.",
        ),
        Rule(
            name="R2: Income eligibility",
            priority=2,
            keyword_groups=[("income",), ("eligible", "apply", "qualify")],
            handler=lambda q, nums, kb: (
                f"Yes, your income {nums[0]} is within the limit of {kb.numeric_facts['income_limit']}. You are eligible to apply."
                if nums and nums[0] <= kb.numeric_facts["income_limit"]
                else f"No, your income {nums[0]} exceeds the limit of {kb.numeric_facts['income_limit']}. You are not eligible."
                if nums
                else "Please provide your family income amount to check eligibility."
            ),
        ),
        Rule(
            name="R3: Minimum marks",
            priority=3,
            keyword_groups=[("marks",), ("minimum", "requirement")],
            handler=lambda q, nums, kb: f"The minimum marks requirement is {kb.numeric_facts['minimum_marks']}.",
        ),
        Rule(
            name="R4: Marks eligibility",
            priority=4,
            keyword_groups=[("marks",), ("qualify", "eligible")],
            handler=lambda q, nums, kb: (
                f"Yes, your marks {nums[0]} meet the minimum requirement of {kb.numeric_facts['minimum_marks']}. You qualify."
                if nums and nums[0] >= kb.numeric_facts["minimum_marks"]
                else f"No, your marks {nums[0]} are below the minimum requirement of {kb.numeric_facts['minimum_marks']}. You do not qualify."
                if nums
                else "Please provide your marks to check qualification."
            ),
        ),
        Rule(
            name="R5: Deadline",
            priority=5,
            keyword_groups=[("deadline",)],
            handler=lambda q, nums, kb: kb.textual_facts.get("application deadline", "Information unavailable."),
        ),
        Rule(
            name="R6: Documents",
            priority=6,
            keyword_groups=[("document",), ("required", "need", "what")],
            handler=lambda q, nums, kb: kb.textual_facts.get("required documents", "Information unavailable."),
        ),
        Rule(
            name="R7: Renewal",
            priority=7,
            keyword_groups=[("renew",), ("criteria", "how")],
            handler=lambda q, nums, kb: kb.textual_facts.get("renewal criteria", "Information unavailable."),
        ),
        Rule(
            name="R8: Contact",
            priority=8,
            keyword_groups=[("contact",)],
            handler=lambda q, nums, kb: kb.textual_facts.get("contact", "Information unavailable."),
        ),
        Rule(
            name="R9: Fallback",
            priority=9,
            keyword_groups=[],
            handler=lambda q, nums, kb: "Information unavailable for this question.",
        ),
    ]
    return sorted(rules, key=lambda r: r.priority)


def answer_question(question: str, kb: KnowledgeBase, rules: List[Rule]) -> Tuple[str, str]:
    question_lower = question.lower()
    numbers = extract_numbers(question_lower)

    for rule in rules:
        if matches_rule(question_lower, rule):
            return rule.name, rule.handler(question_lower, numbers, kb)

    return "R9: Fallback", "Information unavailable for this question."


if __name__ == "__main__":
    kb = load_knowledge_base(Path("scholarship.txt"))
    rule_base = build_rule_base()
    sample_query = "My family income is 200000. Am I eligible?"
    fired_rule, response = answer_question(sample_query, kb, rule_base)
    print(f"[{fired_rule}] {response}")
`;
