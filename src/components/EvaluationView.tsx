import { CheckCircle2, XCircle, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { BENCHMARK_QUESTIONS, FAULTS_FOUND } from '../data/scholarshipData';
import { evaluateQuestion } from '../engine/qaEngine';
import { EngineVersion, ParsedKnowledgeBase } from '../types/qa';

interface EvaluationViewProps {
  kb: ParsedKnowledgeBase;
  engineVersion: EngineVersion;
  onVersionChange: (version: EngineVersion) => void;
  onInspectQuery: (query: string) => void;
}

export function EvaluationView({
  kb,
  engineVersion,
  onVersionChange,
  onInspectQuery,
}: EvaluationViewProps) {
  const finalRuns = BENCHMARK_QUESTIONS.map((q) => {
    const result = evaluateQuestion(q.question, kb, 'final');
    return { item: q, result, passed: q.matcher(result) };
  });

  const originalRuns = BENCHMARK_QUESTIONS.map((q) => {
    const result = evaluateQuestion(q.question, kb, 'original');
    return { item: q, result, passed: q.matcher(result) };
  });

  const activeRuns = engineVersion === 'final' ? finalRuns : originalRuns;
  const activePassedCount = activeRuns.filter((r) => r.passed).length;
  const finalPassedCount = finalRuns.filter((r) => r.passed).length;
  const originalPassedCount = originalRuns.filter((r) => r.passed).length;

  return (
    <div className="space-y-12">
      <section className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">
            Sections 8 & 9 · Live Benchmark Suite & Fault Diagnosis
          </p>
          <h1 className="font-display text-3xl font-semibold text-neutral-950 mt-1">
            Evaluation Results & Fault Analysis
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            All ten assignment test questions are executed live against the active Knowledge Base. Switch between Original and Final versions to observe how fixing Faults 1–5 raised accuracy from 70% to 100%.
          </p>
        </div>

        <div className="inline-flex rounded-lg bg-neutral-100 p-1 shrink-0 border border-neutral-200">
          <button
            type="button"
            onClick={() => onVersionChange('final')}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
              engineVersion === 'final'
                ? 'bg-neutral-950 text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Final Version ({finalPassedCount}/10)
          </button>
          <button
            type="button"
            onClick={() => onVersionChange('original')}
            className={`rounded-md px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap min-h-[40px] ${
              engineVersion === 'original'
                ? 'bg-red-700 text-white font-semibold'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            Original Version ({originalPassedCount}/10)
          </button>
        </div>
      </section>

      {/* Score Banner + Table 3 */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 rounded-2xl bg-neutral-950 text-white p-6 space-y-4">
          <div className="text-xs text-neutral-400">Live Engine Score</div>
          <div className="flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold tabular-nums">
              {activePassedCount} / {BENCHMARK_QUESTIONS.length}
            </span>
            <span
              className={`font-mono text-sm font-semibold tabular-nums ${
                activePassedCount === 10 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {Math.round((activePassedCount / BENCHMARK_QUESTIONS.length) * 100)}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className={`h-full transition-all duration-200 ${
                activePassedCount === 10 ? 'bg-emerald-400' : 'bg-red-500'
              }`}
              style={{ width: `${(activePassedCount / BENCHMARK_QUESTIONS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            {engineVersion === 'final'
              ? 'All factual, inferential, and unsupported test cases pass deterministically.'
              : 'Original v1 fails Test 1 (Fault 4), Test 3 (Fault 2), and Test 10 (Fault 1).'}
          </p>
        </div>

        <div className="lg:col-span-8 space-y-3">
          <h2 className="font-display text-xl font-semibold text-neutral-950 border-b border-neutral-200 pb-2.5">
            01. Table 3 — Reported Accuracy Before and After Fixes
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500">
                  <th className="py-2.5 pr-4 font-medium">Version</th>
                  <th className="py-2.5 pr-4 font-medium">Factual Correct</th>
                  <th className="py-2.5 pr-4 font-medium">Inferential Correct</th>
                  <th className="py-2.5 pr-4 font-medium">Unsupported Handled</th>
                  <th className="py-2.5 font-medium">Overall Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono tabular-nums">
                <tr className={engineVersion === 'original' ? 'bg-red-50/70' : undefined}>
                  <td className="py-3 pr-4 font-sans font-medium text-neutral-950">
                    Original version
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">6 / 7</td>
                  <td className="py-3 pr-4 text-neutral-700">1 / 2</td>
                  <td className="py-3 pr-4 text-neutral-700">0 / 1</td>
                  <td className="py-3 font-semibold text-red-700">7 / 10 = 70%</td>
                </tr>
                <tr className={engineVersion === 'final' ? 'bg-emerald-50/70' : undefined}>
                  <td className="py-3 pr-4 font-sans font-medium text-neutral-950">
                    Final version
                  </td>
                  <td className="py-3 pr-4 text-neutral-700">7 / 7</td>
                  <td className="py-3 pr-4 text-neutral-700">2 / 2</td>
                  <td className="py-3 pr-4 text-neutral-700">1 / 1</td>
                  <td className="py-3 font-semibold text-emerald-700">10 / 10 = 100%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Table 2: Live 10-Question Evaluation Matrix */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-neutral-950">
              02. Table 2 — Live Question Set Evaluation ({engineVersion === 'final' ? 'Final' : 'Original'})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Click Trace on any question to open its step-by-step execution in the console
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-500 tabular-nums">
            {activePassedCount}/10 Passed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500">
                <th className="py-2.5 pr-3 font-medium">#</th>
                <th className="py-2.5 pr-4 font-medium">User Question</th>
                <th className="py-2.5 pr-4 font-medium">Type</th>
                <th className="py-2.5 pr-4 font-medium">Expected</th>
                <th className="py-2.5 pr-4 font-medium">Actual Output</th>
                <th className="py-2.5 pr-4 font-medium">Status</th>
                <th className="py-2.5 text-right font-medium">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {activeRuns.map(({ item, result, passed }) => (
                <tr key={item.id} className={!passed ? 'bg-red-50/50' : 'hover:bg-neutral-50'}>
                  <td className="py-3 pr-3 font-mono tabular-nums text-neutral-500">
                    {item.id}
                  </td>
                  <td className="py-3 pr-4 font-medium text-neutral-950">{item.question}</td>
                  <td className="py-3 pr-4 text-neutral-600 whitespace-nowrap">{item.type}</td>
                  <td className="py-3 pr-4 text-neutral-700">{item.expectedShort}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-neutral-900">
                    {result.shortAnswer}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    {passed ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        <span>FAIL</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onInspectQuery(item.question)}
                      className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors cursor-pointer min-h-[34px]"
                    >
                      <span>Trace</span>
                      <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 9: 5 Faults Found & Fixes */}
      <section className="space-y-4">
        <div className="border-b border-neutral-200 pb-3">
          <h2 className="font-display text-xl font-semibold text-neutral-950">
            03. Section 9 — Faults Found in the Original Version
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Each fault identified during testing can be probed directly in the questioning console
          </p>
        </div>

        <div className="divide-y divide-neutral-200 border-b border-neutral-200">
          {FAULTS_FOUND.map((fault) => (
            <div
              key={fault.id}
              className="py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{fault.id}</span>
                  </span>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="font-semibold text-neutral-950">{fault.title}</span>
                  <span aria-hidden="true" className="text-neutral-300">·</span>
                  <span className="text-neutral-500">{fault.impactedCase}</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-600">
                  <span className="font-medium text-neutral-900">Before:</span> {fault.originalBehavior}
                </p>
                <p className="text-xs sm:text-sm text-emerald-900">
                  <span className="font-medium">Fix:</span> {fault.fixedBehavior}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onInspectQuery(fault.testQuery)}
                className="self-start lg:self-center inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-medium text-neutral-900 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
              >
                <span>Test Probe Query</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
