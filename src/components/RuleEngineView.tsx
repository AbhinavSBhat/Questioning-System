import { ArrowRight, Play } from 'lucide-react';
import { RULE_DEFINITIONS, TECHNIQUES_TABLE } from '../data/scholarshipData';
import { NavSection } from '../types/qa';

interface RuleEngineViewProps {
  onTestQuery: (query: string) => void;
  onNavigate: (section: NavSection) => void;
}

const SAMPLE_BY_RULE: Record<string, string> = {
  R1: 'What is the Income Limit?',
  R2: 'My income is 200000. Am I eligible?',
  R3: 'What is the minimum marks requirement?',
  R4: 'My marks are 80. Do I qualify?',
  R5: 'When is the deadline?',
  R6: 'What documents are required?',
  R7: 'How can I renew the scholarship?',
  R8: 'Who should I contact?',
  R9: 'What is the hostel fee?',
};

const ARCHITECTURE_STAGES = [
  {
    step: '01',
    title: 'Scholarship Document',
    desc: 'Colon-separated plain text guidelines (scholarship.txt).',
  },
  {
    step: '02',
    title: 'Document Parser',
    desc: 'Splits topic:value pairs, normalizes keys, strips commas, extracts ints.',
  },
  {
    step: '03',
    title: 'Fact & Numeric Bases',
    desc: 'Stores textual dictionary and numeric thresholds separately.',
  },
  {
    step: '04',
    title: 'Question Processor',
    desc: 'Lowercases user query and extracts numbers via re.findall(r"\\d+").',
  },
  {
    step: '05',
    title: 'Priority Rule Matching',
    desc: 'Linearly scans ordered Rule dataclass list (R1 → R9) for trigger match.',
  },
  {
    step: '06',
    title: 'Inference & Answer',
    desc: 'Runs threshold checks (<= / >=), retrieves facts, or triggers R9 fallback.',
  },
];

export function RuleEngineView({ onTestQuery, onNavigate }: RuleEngineViewProps) {
  return (
    <div className="space-y-12">
      <section className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">
            Sections 3, 4.1 & 5 · Architecture, Priority Rules & Technique Justification
          </p>
          <h1 className="font-display text-3xl font-semibold text-neutral-950 mt-1">
            System Architecture & Priority Rule Base
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            Rules are evaluated in strict priority order (1 through 9). The first matching rule whose keyword groups and condition hold fires and generates an explainable response.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('ask')}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          <span>Open Live QA Console</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </section>

      {/* Architecture Pipeline Diagram */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3">
          <h2 className="font-display text-xl font-semibold text-neutral-950">
            01. Deterministic Processing Pipeline
          </h2>
          <span className="text-xs text-neutral-500">6 sequential stages</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {ARCHITECTURE_STAGES.map((stage, idx) => (
            <div
              key={stage.step}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-semibold text-neutral-950 tabular-nums">
                    {stage.step}
                  </span>
                  {idx < ARCHITECTURE_STAGES.length - 1 && (
                    <ArrowRight
                      className="hidden lg:block h-3.5 w-3.5 text-neutral-400"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="font-display text-sm font-semibold text-neutral-950">
                  {stage.title}
                </div>
                <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">{stage.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Table 1: Rule Base */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral-950">
              02. Table 1 — Final Priority-Ordered Rule Base
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Click Test Rule on any row to execute its canonical query in the live QA console
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-500">R1 → R9</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2.5 pr-4 font-medium">Priority</th>
                <th className="py-2.5 pr-4 font-medium">Rule</th>
                <th className="py-2.5 pr-4 font-medium">Name</th>
                <th className="py-2.5 pr-4 font-medium">Trigger Keywords (Groups)</th>
                <th className="py-2.5 pr-4 font-medium">Condition / Action</th>
                <th className="py-2.5 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {RULE_DEFINITIONS.map((rule) => (
                <tr key={rule.id} className="hover:bg-neutral-50">
                  <td className="py-3.5 pr-4 font-mono tabular-nums text-neutral-500">
                    {rule.priority}
                  </td>
                  <td className="py-3.5 pr-4 font-mono font-semibold text-neutral-950 whitespace-nowrap">
                    {rule.id}
                  </td>
                  <td className="py-3.5 pr-4 font-medium text-neutral-950 whitespace-nowrap">
                    {rule.name}
                  </td>
                  <td className="py-3.5 pr-4 font-mono text-xs text-neutral-700">
                    {rule.triggerDisplay}
                  </td>
                  <td className="py-3.5 pr-4 text-neutral-700">{rule.conditionAction}</td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onTestQuery(SAMPLE_BY_RULE[rule.id])}
                      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer min-h-[34px]"
                    >
                      <Play className="h-3 w-3" aria-hidden="true" />
                      <span>Test Rule</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AI Techniques Justification */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200 pb-3">
          <h2 className="font-display text-xl font-semibold text-neutral-950">
            03. AI Techniques Used & Design Justification
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-3xl leading-relaxed">
            Because scholarship guidelines contain a compact set of well-defined attributes and numeric eligibility thresholds, deterministic rule-based reasoning avoids NLP pipelines and generative models while remaining fully explainable.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2.5 pr-6 font-medium">AI Technique</th>
                <th className="py-2.5 font-medium">Role in the System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {TECHNIQUES_TABLE.map((row) => (
                <tr key={row.technique}>
                  <td className="py-3.5 pr-6 font-semibold text-neutral-950 whitespace-nowrap">
                    {row.technique}
                  </td>
                  <td className="py-3.5 text-neutral-700">{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
