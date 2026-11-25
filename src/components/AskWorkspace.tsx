import { useState, FormEvent } from 'react';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import {
  EngineVersion,
  NavSection,
  ParsedKnowledgeBase,
  QAResult,
} from '../types/qa';
import { QUICK_SAMPLE_QUESTIONS } from '../data/scholarshipData';

interface AskWorkspaceProps {
  question: string;
  onQuestionChange: (q: string) => void;
  onAskQuestion: (q: string) => void;
  result: QAResult;
  kb: ParsedKnowledgeBase;
  engineVersion: EngineVersion;
  onVersionChange: (version: EngineVersion) => void;
  onNavigate: (section: NavSection) => void;
}

const FAULT_PROBES = [
  {
    label: 'Fault 1 · Unsupported',
    query: 'What is the hostel fee?',
  },
  {
    label: 'Fault 2 · Apply Phrasing',
    query: 'My income is 300000. Can I apply?',
  },
  {
    label: 'Fault 3 · Boundary 75',
    query: 'My marks are 75. Do I qualify?',
  },
  {
    label: 'Fault 4 · Capitalization',
    query: 'What is the Income Limit?',
  },
];

export function AskWorkspace({
  question,
  onQuestionChange,
  onAskQuestion,
  result,
  kb,
  engineVersion,
  onVersionChange,
  onNavigate,
}: AskWorkspaceProps) {
  const [showRuleScan, setShowRuleScan] = useState(true);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      onAskQuestion(question);
    }
  };

  const getOutcomeStyle = () => {
    switch (result.outcome) {
      case 'eligible':
        return {
          surface: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-50',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />,
          label: 'ELIGIBLE · CONDITION MET',
          labelClass: 'text-emerald-300',
        };
      case 'ineligible':
        return {
          surface: 'border-red-500/35 bg-red-950/40 text-red-50',
          icon: <XCircle className="h-5 w-5 text-red-400 shrink-0" aria-hidden="true" />,
          label: 'NOT ELIGIBLE · THRESHOLD FAILED',
          labelClass: 'text-red-300',
        };
      case 'factual':
        return {
          surface: 'border-sky-400/30 bg-sky-950/35 text-neutral-50',
          icon: <Info className="h-5 w-5 text-sky-300 shrink-0" aria-hidden="true" />,
          label: 'FACT RETRIEVED',
          labelClass: 'text-sky-300',
        };
      case 'error':
        return {
          surface: 'border-red-500/45 bg-red-950/60 text-red-50',
          icon: <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" aria-hidden="true" />,
          label: 'ENGINE FAULT TRIGGERED',
          labelClass: 'text-red-300',
        };
      case 'unavailable':
      default:
        return {
          surface: 'border-amber-400/35 bg-amber-950/35 text-amber-50',
          icon: <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" aria-hidden="true" />,
          label: 'FALLBACK · INFORMATION UNAVAILABLE',
          labelClass: 'text-amber-300',
        };
    }
  };

  const outcome = getOutcomeStyle();
  const textualCount = Object.keys(kb.textualFacts).length;
  const numericCount = Object.keys(kb.numericFacts).length;

  return (
    <div className="space-y-12">
      {/* Editorial Masthead */}
      <section className="border-b border-neutral-200 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-3">
            <p className="text-xs font-medium tracking-wide text-neutral-500">
              AID201A Artificial Intelligence · Abhinav S Bhat · 25ETAI410006 · Ramaiah University
            </p>
            <h1
              className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.12] text-neutral-950 max-w-3xl"
              style={{ textWrap: 'balance' }}
            >
              Rule-Based Scholarship Document Question Answering
            </h1>
            <p className="text-base text-neutral-600 max-w-2xl leading-relaxed">
              Deterministic question answering over structured college scholarship guidelines. Every response is derived from colon-delimited facts, regular-expression number extraction, and priority-ordered IF–THEN inference—without NLP or RAG.
            </p>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-x-6 gap-y-4 border-t lg:border-t-0 lg:border-l border-neutral-200 pt-5 lg:pt-0 lg:pl-8">
            <div>
              <div className="text-xs text-neutral-500">Benchmark</div>
              <div className="font-display text-2xl font-semibold text-neutral-950 tabular-nums mt-0.5">
                {engineVersion === 'final' ? '10 / 10' : '7 / 10'}
              </div>
              <div className="text-xs text-neutral-500">
                {engineVersion === 'final' ? '100% accuracy' : '70% original v1'}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Knowledge Base</div>
              <div className="font-display text-2xl font-semibold text-neutral-950 tabular-nums mt-0.5">
                {textualCount} Facts
              </div>
              <div className="text-xs text-neutral-500 tabular-nums">
                {numericCount} numeric thresholds
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Ink Questioning Console */}
      <section
        aria-label="Interactive Questioning Console"
        className="rounded-2xl bg-neutral-950 text-neutral-100 p-6 sm:p-8 lg:p-10 shadow-sm"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Interactive Questioning Console
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Submit a student query or test edge cases across both engine versions
            </p>
          </div>

          {/* Engine Version Segmented Control */}
          <div className="inline-flex rounded-lg bg-neutral-900 p-1 border border-neutral-800 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => onVersionChange('final')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap min-h-[38px] ${
                engineVersion === 'final'
                  ? 'bg-white text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Final Engine (Fixed)
            </button>
            <button
              type="button"
              onClick={() => onVersionChange('original')}
              className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap min-h-[38px] ${
                engineVersion === 'original'
                  ? 'bg-red-600 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Original Engine (5 Faults)
            </button>
          </div>
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400"
                aria-hidden="true"
              />
              <input
                id="qa-question-input"
                aria-label="Ask a scholarship question"
                type="text"
                value={question}
                onChange={(e) => onQuestionChange(e.target.value)}
                placeholder="Ask e.g. My family income is 200000. Am I eligible?"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-11 pr-4 py-3.5 text-sm sm:text-base text-white placeholder:text-neutral-500 focus:border-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/20 min-h-[48px]"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-neutral-950 transition-colors duration-150 hover:bg-neutral-200 whitespace-nowrap shrink-0 min-h-[48px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950"
            >
              <span>Evaluate Query</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Sample Queries Strip */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-400 mr-1">Try sample:</span>
            {QUICK_SAMPLE_QUESTIONS.map((sample) => {
              const active = question.trim() === sample;
              return (
                <button
                  key={sample}
                  type="button"
                  onClick={() => onAskQuestion(sample)}
                  className={`rounded-md border px-2.5 py-1.5 text-xs transition-colors duration-150 cursor-pointer min-h-[34px] ${
                    active
                      ? 'border-white bg-white text-neutral-950 font-semibold'
                      : 'border-neutral-800 bg-neutral-900/80 text-neutral-300 hover:border-neutral-600 hover:text-white'
                  }`}
                >
                  {sample}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => onAskQuestion('My family income is 200000. Am I eligible?')}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </form>

        {/* Answer Display Inside Console */}
        <div
          aria-live="polite"
          className={`mt-7 rounded-xl border p-5 sm:p-6 transition-colors duration-150 ${outcome.surface}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              {outcome.icon}
              <span className={`font-mono text-xs font-semibold tracking-wide ${outcome.labelClass}`}>
                {outcome.label}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-300 tabular-nums">
              <span>
                {result.matchedRuleId
                  ? `${result.matchedRuleId} · ${result.matchedRuleName}`
                  : 'No Rule Matched'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{result.latencyMs.toFixed(2)} ms</span>
            </div>
          </div>

          <p className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug tracking-[0.01em]">
            {result.answer}
          </p>
          <p className="mt-2 text-sm text-neutral-300 tracking-[0.01em]">
            {result.explanation}
          </p>

          {result.faultTriggered && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-950/60 px-4 py-2.5 text-xs text-red-200">
              <span className="font-semibold text-white">Diagnostic Note: </span>
              {result.faultTriggered} Switch to <span className="font-semibold text-white">Final Engine</span> above to verify the fix.
            </div>
          )}
        </div>
      </section>

      {/* Asymmetric Two-Column Editorial Grid: Reasoning Trace (7 cols) + Context & Probes (5 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Reasoning Trace & Rule Evaluation Table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-neutral-950">
                01. Deterministic Reasoning Trace
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Every step from parsed fact base to final rule action
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowRuleScan((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-950 cursor-pointer whitespace-nowrap"
            >
              <span>{showRuleScan ? 'Hide Rule Scan' : 'Show Rule Scan'}</span>
              {showRuleScan ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          <ol className="divide-y divide-neutral-200">
            {result.steps.map((step) => (
              <li key={step.stepNumber} className="py-4 first:pt-1 flex items-start gap-4">
                <span
                  className={`mt-0.5 font-mono text-xs font-semibold tabular-nums shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                    step.status === 'fault'
                      ? 'bg-red-100 text-red-800'
                      : step.status === 'fallback'
                      ? 'bg-amber-100 text-amber-900'
                      : step.status === 'matched'
                      ? 'bg-neutral-950 text-white'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  0{step.stepNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-neutral-950">{step.title}</div>
                  <div className="mt-1 font-mono text-xs text-neutral-600 break-words leading-relaxed">
                    {step.detail}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          {showRuleScan && (
            <div className="pt-4 border-t border-neutral-200">
              <h3 className="text-xs font-semibold text-neutral-700 mb-3">
                Priority Rule Evaluation Log (R1 → R9)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-neutral-200 text-neutral-500">
                      <th className="py-2 pr-3 font-medium">Prio</th>
                      <th className="py-2 pr-3 font-medium">Rule</th>
                      <th className="py-2 pr-3 font-medium">Outcome</th>
                      <th className="py-2 font-medium">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {result.ruleChecks.map((rc) => (
                      <tr
                        key={rc.ruleId}
                        className={rc.matched ? 'bg-neutral-100/80' : undefined}
                      >
                        <td className="py-2.5 pr-3 font-mono tabular-nums text-neutral-500">
                          {rc.priority}
                        </td>
                        <td className="py-2.5 pr-3 font-medium text-neutral-950 whitespace-nowrap">
                          {rc.ruleId} · {rc.ruleName}
                        </td>
                        <td className="py-2.5 pr-3 font-mono whitespace-nowrap">
                          {rc.matched ? (
                            <span className="font-semibold text-neutral-950">FIRED</span>
                          ) : (
                            <span className="text-neutral-400">SKIPPED</span>
                          )}
                        </td>
                        <td className="py-2.5 text-neutral-600">{rc.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Context Margin Column */}
        <aside className="lg:col-span-5 space-y-8 lg:border-l lg:border-neutral-200 lg:pl-10">
          {/* Regex & Numeric Thresholds */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
              <h2 className="font-display text-xl font-semibold text-neutral-950">
                02. Active Fact Base
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('knowledge-base')}
                className="text-xs font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-600 cursor-pointer whitespace-nowrap"
              >
                Edit Document
              </button>
            </div>

            <dl className="grid grid-cols-2 gap-4 bg-neutral-50 border border-neutral-200 rounded-xl p-4">
              <div>
                <dt className="font-mono text-xs text-neutral-500">income_limit</dt>
                <dd className="font-mono text-lg font-semibold text-neutral-950 tabular-nums mt-0.5">
                  {kb.numericFacts['income_limit'] ?? 'Missing'}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-xs text-neutral-500">minimum_marks</dt>
                <dd className="font-mono text-lg font-semibold text-neutral-950 tabular-nums mt-0.5">
                  {kb.numericFacts['minimum_marks'] ?? 'Missing'}
                </dd>
              </div>
              <div className="col-span-2 pt-3 border-t border-neutral-200">
                <dt className="text-xs text-neutral-500">Extracted from query via regex</dt>
                <dd className="font-mono text-xs text-neutral-900 mt-1 tabular-nums">
                  re.findall(r&quot;\d+&quot;, q) → [{result.extractedNumbers.join(', ')}]
                </dd>
              </div>
            </dl>

            <dl className="divide-y divide-neutral-200 text-xs">
              {Object.entries(kb.textualFacts)
                .slice(0, 5)
                .map(([key, val]) => (
                  <div key={key} className="py-2.5 flex justify-between gap-4">
                    <dt className="font-mono text-neutral-500 shrink-0">{key}</dt>
                    <dd className="text-neutral-900 text-right truncate">{val}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Fault Probes */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between border-b border-neutral-200 pb-2">
              <h3 className="font-display text-base font-semibold text-neutral-950">
                Fault-Sensitive Probes
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('evaluation')}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-950 cursor-pointer"
              >
                View All 5 Faults
              </button>
            </div>
            <div className="divide-y divide-neutral-200 border-b border-neutral-200">
              {FAULT_PROBES.map((probe) => (
                <button
                  key={probe.label}
                  type="button"
                  onClick={() => onAskQuestion(probe.query)}
                  className="w-full py-3 flex items-center justify-between gap-3 text-left group cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-neutral-900 group-hover:underline underline-offset-2">
                      {probe.label}
                    </div>
                    <div className="text-xs text-neutral-500 truncate mt-0.5">
                      {probe.query}
                    </div>
                  </div>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-neutral-400 group-hover:text-neutral-950 shrink-0 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
