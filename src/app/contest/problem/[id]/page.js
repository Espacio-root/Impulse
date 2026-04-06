'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProblemPage() {
  const { id } = useParams();
  const router = useRouter();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code goes here\n    return 0;\n}\n');
  const [submitting, setSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`/api/problems`)
      .then(r => r.json())
      .then(d => {
        const p = d.problems.find(x => x.id === id);
        if (p) setProblem(p);
      });
  }, [id]);

  const handleSubmit = async () => {
    const username = localStorage.getItem('contest_username');
    if (!username) { alert('Not logged in'); return; }
    
    setSubmitting(true);
    setVerdict('PENDING');
    setMessage('Evaluating...');
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, problemId: id, username })
      });
      const data = await res.json();
      
      if (res.status === 403) {
        setVerdict('RTE');
        setMessage(data.error);
        return;
      }
      
      setVerdict(data.verdict);
      setMessage(data.message);
      
    } catch (err) {
      setVerdict('RTE');
      setMessage('System Error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="container">Loading problem...</div>;

  return (
    <div className="problem-split">
      <div className="problem-desc">
        <h2>{problem.id}. {problem.title}</h2>
        <div style={{ marginTop: '16px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Points: {problem.points}
        </div>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
          {problem.statement}
        </div>
      </div>
      
      <div className="problem-editor">
        <textarea 
          className="editor-textarea" 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
        />
        <div className="editor-footer">
          <div>
            {verdict && (
              <span className={`verdict ${verdict}`}>{verdict} - {message}</span>
            )}
          </div>
          <button 
            className="success" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
