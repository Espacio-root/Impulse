'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';

const DEFAULT_CODE = `#include <iostream>
using namespace std;

int main() {
    // your code goes here
    return 0;
}
`;

export default function ProblemPage() {
  const { id } = useParams();
  const router = useRouter();
  const editorRef = useRef(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [codeLoaded, setCodeLoaded] = useState(false);

  // Run state
  const [running, setRunning] = useState(false);
  const [runResults, setRunResults] = useState(null);
  const [compileError, setCompileError] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(0);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitVerdict, setSubmitVerdict] = useState(null);
  const [submitMessage, setSubmitMessage] = useState('');

  // Console tab: 'testcase' (input view) or 'result' (after run)
  const [consoleTab, setConsoleTab] = useState('testcase');

  // Load saved code from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`code_${id}`);
    setCode(saved || DEFAULT_CODE);
    setCodeLoaded(true);
  }, [id]);

  const handleEditorChange = useCallback((value) => {
    const newCode = value || '';
    setCode(newCode);
    localStorage.setItem(`code_${id}`, newCode);
  }, [id]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    fetch(`/api/problems`)
      .then(r => r.json())
      .then(d => {
        const p = d.problems.find(x => x.id === id);
        if (p) setProblem(p);
      });
  }, [id]);

  const handleRun = async () => {
    setRunning(true);
    setRunResults(null);
    setCompileError(null);
    setSubmitVerdict(null);
    setConsoleTab('result');

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, problemId: id })
      });
      const data = await res.json();

      if (!data.compiled) {
        setCompileError(data.stderr || data.error);
      } else {
        setRunResults(data);
        setSelectedTestCase(0);
      }
    } catch (err) {
      setCompileError('System error - could not reach server');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    const username = localStorage.getItem('contest_username');
    if (!username) { alert('Not logged in'); return; }

    setSubmitting(true);
    setSubmitVerdict('PENDING');
    setSubmitMessage('Judging against all test cases...');
    setRunResults(null);
    setCompileError(null);
    setConsoleTab('result');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, problemId: id, username })
      });
      const data = await res.json();

      if (res.status === 403) {
        setSubmitVerdict('RTE');
        setSubmitMessage(data.error);
        return;
      }

      setSubmitVerdict(data.verdict);
      setSubmitMessage(data.message);
    } catch (err) {
      setSubmitVerdict('RTE');
      setSubmitMessage('System Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem || !codeLoaded) {
    return (
      <div className="loading-container" style={{ paddingTop: '40vh' }}>
        Loading problem...
      </div>
    );
  }

  const samples = problem.samples || [];

  return (
    <div className="problem-split">
      {/* Left: Problem Description */}
      <div className="problem-left">
        <div className="problem-tabs">
          <button className="problem-tab active">Description</button>
        </div>
        <div className="problem-desc">
          <h2>{problem.id}. {problem.title}</h2>
          <div className="problem-meta">
            <span className={`difficulty-tag ${problem.difficulty || 'Easy'}`}>
              {problem.difficulty || 'Easy'}
            </span>
            <span className="problem-points-badge">
              {problem.points} pts
            </span>
          </div>
          <div className="problem-statement">
            {problem.statement}
          </div>
        </div>
      </div>

      {/* Right: Editor + Console */}
      <div className="problem-right">
        <div className="editor-header">
          <div className="editor-lang">
            <span className="editor-lang-dot" />
            C++
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <Editor
            height="100%"
            defaultLanguage="cpp"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              padding: { top: 12 },
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
            }}
          />
        </div>

        {/* Console Panel */}
        <div className="console-panel">
          <div className="console-header">
            <div className="console-tabs">
              <button
                className={`console-tab ${consoleTab === 'testcase' ? 'active' : ''}`}
                onClick={() => setConsoleTab('testcase')}
              >
                Testcase
              </button>
              <button
                className={`console-tab ${consoleTab === 'result' ? 'active' : ''}`}
                onClick={() => setConsoleTab('result')}
              >
                Result
              </button>
            </div>
            <div className="console-actions">
              <button
                className="btn-run"
                onClick={handleRun}
                disabled={running || submitting}
              >
                {running ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="spinner" /> Running
                  </span>
                ) : 'Run'}
              </button>
              <button
                className="btn-submit"
                onClick={handleSubmit}
                disabled={running || submitting}
              >
                {submitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="spinner" /> Judging
                  </span>
                ) : 'Submit'}
              </button>
            </div>
          </div>

          <div className="console-body">
            {/* Testcase Tab */}
            {consoleTab === 'testcase' && (
              <div className="fade-in">
                {samples.length > 0 && (
                  <>
                    <div className="testcase-selector">
                      {samples.map((_, i) => (
                        <button
                          key={i}
                          className={`testcase-chip ${selectedTestCase === i ? 'active' : ''}`}
                          onClick={() => setSelectedTestCase(i)}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="testcase-detail">
                      <div className="testcase-field">
                        <label>Input</label>
                        <pre>{samples[selectedTestCase].input.trim()}</pre>
                      </div>
                      <div className="testcase-field">
                        <label>Expected Output</label>
                        <pre>{samples[selectedTestCase].expectedOutput.trim()}</pre>
                      </div>
                    </div>
                  </>
                )}
                {samples.length === 0 && (
                  <div className="empty-state">No sample test cases available.</div>
                )}
              </div>
            )}

            {/* Result Tab */}
            {consoleTab === 'result' && (
              <div className="fade-in">
                {/* Submit verdict banner */}
                {submitVerdict && (
                  <div className={`submit-verdict-banner ${submitVerdict}`}>
                    {submitVerdict === 'PENDING' && <span className="spinner" />}
                    {submitVerdict === 'AC' && <span>{'\u2713'}</span>}
                    {submitVerdict === 'WA' && <span>{'\u2717'}</span>}
                    {submitVerdict === 'RTE' && <span>{'\u26A0'}</span>}
                    <span>{submitVerdict} — {submitMessage}</span>
                  </div>
                )}

                {/* Compile error */}
                {compileError && (
                  <div className="compile-error">
                    <div className="compile-error-title">Compilation Error</div>
                    <pre>{compileError}</pre>
                  </div>
                )}

                {/* Run results */}
                {runResults && (
                  <>
                    <div className={`run-summary ${runResults.allPassed ? 'all-passed' : 'some-failed'}`}>
                      <span className="run-summary-text">
                        {runResults.allPassed ? '\u2713 ' : '\u2717 '}
                        {runResults.summary}
                      </span>
                    </div>

                    <div className="testcase-selector">
                      {runResults.results.map((r, i) => (
                        <button
                          key={i}
                          className={`testcase-chip ${selectedTestCase === i ? 'active' : ''} ${r.passed ? 'passed' : 'failed'}`}
                          onClick={() => setSelectedTestCase(i)}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>

                    {runResults.results[selectedTestCase] && (() => {
                      const r = runResults.results[selectedTestCase];
                      return (
                        <div className="testcase-detail">
                          <div className="testcase-field">
                            <label>Input</label>
                            <pre>{r.input}</pre>
                          </div>
                          <div className="testcase-field">
                            <label>Expected Output</label>
                            <pre>{r.expectedOutput}</pre>
                          </div>
                          <div className="testcase-field">
                            <label>Your Output</label>
                            <pre className={r.passed ? 'correct' : 'wrong'}>
                              {r.error ? r.error : (r.actualOutput || '(no output)')}
                            </pre>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Nothing to show yet */}
                {!submitVerdict && !compileError && !runResults && !running && !submitting && (
                  <div className="empty-state">
                    Click <strong>Run</strong> to test against sample cases, or <strong>Submit</strong> to judge against all test cases.
                  </div>
                )}

                {/* Loading states */}
                {(running || submitting) && !submitVerdict && !compileError && !runResults && (
                  <div className="empty-state">
                    <span className="spinner" style={{ marginRight: '8px' }} />
                    {running ? 'Compiling and running...' : 'Judging...'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
