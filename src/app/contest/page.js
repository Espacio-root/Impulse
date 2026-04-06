'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ContestDashboard() {
  const [data, setData] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const router = useRouter();

  useEffect(() => {
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
        clearInterval(interval);
      } else {
        const hs = Math.floor(diff / 3600000);
        const ms = Math.floor((diff % 3600000) / 60000);
        const ss = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hs}h ${ms}m ${ss}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data]);

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>Dashboard</h2>
        <div className="panel" style={{ marginBottom: 0, padding: '12px 24px', color: timeLeft === 'Contest Over' ? 'var(--error-color)' : 'inherit' }}>
          <strong>Time Left: </strong>
          <span style={{ fontFamily: 'var(--font-mono)' }}>{timeLeft}</span>
        </div>
      </div>
      
      <div className="panel">
        <h3>Problems</h3>
        <table style={{ marginTop: '16px' }}>
          <thead>
            <tr>
              <th>Status</th>
              <th>#</th>
              <th>Name</th>
              <th>Points</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.problems.map(p => (
              <tr key={p.id}>
                <td>
                  {p.isSolved ? <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ AC</span> : '-'}
                </td>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.points}</td>
                <td>
                  <Link href={`/contest/problem/${p.id}`}>
                    <button className="primary">Solve</button>
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
