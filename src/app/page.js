'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('contest_username', data.userId);
        router.push('/contest');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="panel login-card">
        <div className="login-logo">I</div>
        <h1 className="login-title">Impulse</h1>
        <p className="login-subtitle">Virtual Contest Simulator &mdash; powered by Persistent Segment Trees</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Enter your handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ marginBottom: '16px' }}
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            className="primary"
            style={{ width: '100%', padding: '12px' }}
            disabled={loading || !username.trim()}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" /> Joining...
              </span>
            ) : 'Enter Contest'}
          </button>
        </form>
      </div>
    </div>
  );
}
