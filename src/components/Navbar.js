import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="brand">
        <span style={{ color: 'var(--accent-color)' }}>⚡</span> Contest Simulator
      </div>
      <div className="nav-links">
        <Link href="/contest">Dashboard</Link>
        <Link href="/leaderboard">Leaderboard</Link>
      </div>
    </header>
  );
}
