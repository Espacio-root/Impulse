'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContestDashboard() {
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [isOver, setIsOver] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('contest_username');
    if (!user) {
      router.push('/');
      return;
    }

    fetch(`/api/problems?username=${encodeURIComponent(user)}`)
      .then(res => res.json())
      .then(d => setData(d));
  }, [router]);

  useEffect(() => {
    if (!data?.times) return;
    const interval = setInterval(() => {
      const diff = data.times.end - Date.now();
      if (diff <= 0) {
        setTimeLeft('Contest Over');
        setIsOver(true);
        clearInterval(interval);
      } else {
        const hs = String(Math.floor(diff / 3600000)).padStart(2, '0');
        const ms = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
        setTimeLeft(`${hs}:${ms}:${ss}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (!mounted || !data) return <div className="container loading-container">Loading...</div>;

  const solvedCount = data.problems.filter(p => p.isSolved).length;

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h2>Contest Problems</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
            {solvedCount}/{data.problems.length} solved
          </p>
        </div>
        <div className={`timer-badge ${isOver ? 'over' : ''}`}>
          <span className={`timer-dot ${isOver ? 'over' : ''}`} />
          <span>{timeLeft || '--:--:--'}</span>
        </div>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '70px' }}>Status</th>
              <th style={{ width: '50px' }}>#</th>
              <th>Title</th>
              <th style={{ width: '100px' }}>Difficulty</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Points</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.problems.map(p => (
              <tr key={p.id}>
                <td>
                  {p.isSolved ? (
                    <span className="status-badge solved">{'\u2713'}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>–</span>
                  )}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{p.id}</td>
                <td>
                  <Link href={`/contest/problem/${p.id}`} style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {p.title}
                  </Link>
                </td>
                <td>
                  <span className={`difficulty-tag ${p.difficulty || 'Easy'}`}>
                    {p.difficulty || 'Easy'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{p.points}</td>
                <td style={{ textAlign: 'center' }}>
                  <Link href={`/contest/problem/${p.id}`}>
                    <button className="solve-btn">Solve</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
