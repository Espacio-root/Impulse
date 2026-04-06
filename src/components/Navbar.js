'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('contest_username');
    if (user) setUsername(user);
  }, []);

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link href="/contest" style={{ textDecoration: 'none' }}>
          <div className="brand">
            <span className="brand-icon">I</span>
            Impulse
          </div>
        </Link>
        <div className="nav-links">
          <Link href="/contest">Problems</Link>
          <Link href="/leaderboard">Leaderboard</Link>
        </div>
      </div>
      {username && (
        <div className="nav-user">
          <div className="nav-user-avatar">
            {username.charAt(0).toUpperCase()}
          </div>
          <span>{username}</span>
        </div>
      )}
    </header>
  );
}
