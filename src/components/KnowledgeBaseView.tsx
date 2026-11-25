import { RotateCcw, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  COMMA_TEST_SCHOLARSHIP_TEXT,
  DEFAULT_SCHOLARSHIP_TEXT,
} from '../data/scholarshipData';
import { EngineVersion, NavSection, ParsedKnowledgeBase } from '../types/qa';

interface KnowledgeBaseViewProps {
  documentText: string;
  onDocumentChange: (text: string) => void;
  kb: ParsedKnowledgeBase;
  engineVersion: EngineVersion;
  onVersionChange: (v: EngineVersion) => void;
  onNavigate: (section: NavSection) => void;
}

export function KnowledgeBaseView({
  documentText,
  onDocumentChange,
  kb,
  engineVersion,
  onVersionChange,
  onNavigate,
}: KnowledgeBaseViewProps) {
  const hasCommaWarning = kb.parsedLines.some((line) => line.commaWarning);

  return (
    <div className="space-y-10">
      <section className="border-b border-neutral-200 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-neutral-500">
            Section 4.2 · Document Processing & Knowledge Representation
          </p>
          <h1 className="font-display text-3xl font-semibold text-neutral-950 mt-1">
            Document Parser & Knowledge Base
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
            The parser reads <code className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 rounded">scholarship.txt</code> line by line, splits on the first colon, normalizes topics to lowercase, and stores numeric thresholds separately. Edits below immediately update the QA engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('ask')}
          className="inline-flex items-center gap-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-neutral-800 whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
        >
          <span>Query This Document</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Dark Code Editor for scholarship.txt */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-neutral-950">
              01. Input Source (scholarship.txt)
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDocumentChange(COMMA_TEST_SCHOLARSHIP_TEXT)}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 cursor-pointer whitespace-nowrap"
              >
                Load Comma Test (250,000)
              </button>
              <button
                type="button"
                onClick={() => onDocumentChange(DEFAULT_SCHOLARSHIP_TEXT)}
                className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 cursor-pointer whitespace-nowrap"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <textarea
            aria-label="Scholarship document input"
            value={documentText}
            onChange={(e) => onDocumentChange(e.target.value)}
            rows={11}
            spellCheck={false}
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs sm:text-sm leading-relaxed text-neutral-100 focus:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-neutral-600">
            <span>Numeric extraction mode:</span>
            <div className="inline-flex rounded-lg bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => onVersionChange('final')}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  engineVersion === 'final'
                    ? 'bg-white text-neutral-950 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Final (Strip Commas)
              </button>
              <button
                type="button"
                onClick={() => onVersionChange('original')}
                className={`rounded-md px-3 py-1.5 font-medium transition-colors cursor-pointer ${
                  engineVersion === 'original'
                    ? 'bg-white text-red-700 shadow-xs font-semibold'
                    : 'text-neutral-600 hover:text-neutral-950'
                }`}
              >
                Original (Fault 5)
              </button>
            </div>
          </div>

          {hasCommaWarning && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-900">
              <AlertTriangle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold">Fault 5 Detected: </span>
                Comma-formatted value (e.g., <code className="font-mono">250,000</code>) could not be stored in <code className="font-mono">numeric_facts</code> by the Original parser. Switch to Final parser to strip commas.
              </div>
            </div>
          )}
        </div>

        {/* Right: Parsed Dictionaries with Clean Hairlines */}
        <div className="lg:col-span-6 space-y-8 lg:border-l lg:border-neutral-200 lg:pl-10">
          <div>
            <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3 mb-3">
              <h2 className="font-display text-lg font-semibold text-neutral-950">
                02. Numeric Facts Dictionary
              </h2>
              <span className="font-mono text-xs text-neutral-500 tabular-nums">
                {Object.keys(kb.numericFacts).length} keys
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2 pr-4 font-medium">Simplified Key</th>
                    <th className="py-2 pr-4 font-medium">Integer Value</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {Object.entries(kb.numericFacts).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-2.5 pr-4 font-mono text-neutral-900">{key}</td>
                      <td className="py-2.5 pr-4 font-mono font-semibold text-neutral-950 tabular-nums">
                        {value}
                      </td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Parsed</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {Object.keys(kb.numericFacts).length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-xs text-neutral-500">
                        No numeric thresholds extracted.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between border-b border-neutral-200 pb-3 mb-3">
              <h2 className="font-display text-lg font-semibold text-neutral-950">
                03. Textual Fact Base Dictionary
              </h2>
              <span className="font-mono text-xs text-neutral-500 tabular-nums">
                {Object.keys(kb.textualFacts).length} records
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-500">
                    <th className="py-2 pr-4 font-medium">Topic Key</th>
                    <th className="py-2 font-medium">Stored Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {Object.entries(kb.textualFacts).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-2.5 pr-4 font-mono text-xs text-neutral-500 whitespace-nowrap align-top">
                        {key}
                      </td>
                      <td className="py-2.5 text-neutral-900">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
