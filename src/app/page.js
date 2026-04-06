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
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="panel" style={{ width: '400px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem', color: 'var(--accent-color)' }}>Contest Simulator</h1>
        <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>Enter your handle to join the contest</p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="text" 
            placeholder="Codeforces Handle" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          />
          <button type="submit" className="primary" style={{ width: '100%' }} disabled={loading || !username.trim()}>
            {loading ? 'Entering...' : 'Enter Contest'}
          </button>
        </form>
      </div>
    </div>
  );
}
