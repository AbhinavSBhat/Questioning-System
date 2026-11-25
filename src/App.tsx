/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState } from 'react';
import { DEFAULT_SCHOLARSHIP_TEXT, REPORT_METADATA } from './data/scholarshipData';
import { evaluateQuestion, parseScholarshipDocument } from './engine/qaEngine';
import { EngineVersion, NavSection } from './types/qa';
import { Header } from './components/Header';
import { AskWorkspace } from './components/AskWorkspace';
import { KnowledgeBaseView } from './components/KnowledgeBaseView';
import { RuleEngineView } from './components/RuleEngineView';
import { EvaluationView } from './components/EvaluationView';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('ask');
  const [documentText, setDocumentText] = useState<string>(DEFAULT_SCHOLARSHIP_TEXT);
  const [engineVersion, setEngineVersion] = useState<EngineVersion>('final');
  const [questionInput, setQuestionInput] = useState<string>(
    'My family income is 200000. Am I eligible?'
  );
  const [submittedQuestion, setSubmittedQuestion] = useState<string>(
    'My family income is 200000. Am I eligible?'
  );

  const knowledgeBase = useMemo(
    () => parseScholarshipDocument(documentText, engineVersion),
    [documentText, engineVersion]
  );

  const qaResult = useMemo(
    () => evaluateQuestion(submittedQuestion, knowledgeBase, engineVersion),
    [submittedQuestion, knowledgeBase, engineVersion]
  );

  const handleAskQuestion = (q: string) => {
    setQuestionInput(q);
    setSubmittedQuestion(q);
  };

  const handleTestFromOtherView = (q: string) => {
    setQuestionInput(q);
    setSubmittedQuestion(q);
    setActiveSection('ask');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSection = (section: NavSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-950">
      <Header
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        onRunBenchmark={() => handleSelectSection('evaluation')}
      />

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        {activeSection === 'ask' && (
          <AskWorkspace
            question={questionInput}
            onQuestionChange={setQuestionInput}
            onAskQuestion={handleAskQuestion}
            result={qaResult}
            kb={knowledgeBase}
            engineVersion={engineVersion}
            onVersionChange={setEngineVersion}
            onNavigate={handleSelectSection}
          />
        )}

        {activeSection === 'knowledge-base' && (
          <KnowledgeBaseView
            documentText={documentText}
            onDocumentChange={setDocumentText}
            kb={knowledgeBase}
            engineVersion={engineVersion}
            onVersionChange={setEngineVersion}
            onNavigate={handleSelectSection}
          />
        )}

        {activeSection === 'rule-engine' && (
          <RuleEngineView
            onTestQuery={handleTestFromOtherView}
            onNavigate={handleSelectSection}
          />
        )}

        {activeSection === 'evaluation' && (
          <EvaluationView
            kb={knowledgeBase}
            engineVersion={engineVersion}
            onVersionChange={setEngineVersion}
            onInspectQuery={handleTestFromOtherView}
          />
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            {REPORT_METADATA.title} · {REPORT_METADATA.studentName} ({REPORT_METADATA.registerNo}) · {REPORT_METADATA.university}
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSelectSection('ask')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Ask & Trace
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('knowledge-base')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Knowledge Base
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('rule-engine')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Rule Engine
            </button>
            <button
              type="button"
              onClick={() => handleSelectSection('evaluation')}
              className="hover:text-neutral-950 cursor-pointer"
            >
              Evaluation
            </button>
            <a
              href={REPORT_METADATA.oneDriveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-600"
            >
              OneDrive Code Link
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

