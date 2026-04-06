'use client';

import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/Navbar';

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [sliderValue, setSliderValue] = useState(-1);

  const isSlidingRef = useRef(false);
  const sliderValueRef = useRef(-1);
  const timesRef = useRef(null);

  const fetchLeaderboard = async (requestedTime = null) => {
    let url = '/api/leaderboard';
    if (requestedTime) url += `?timestamp=${requestedTime}`;

    try {
      const r = await fetch(url);
      const d = await r.json();
      timesRef.current = d.times;
      setData(d);

      if (sliderValueRef.current === -1 && d.times) {
        const duration = Math.min(d.times.now, d.times.end) - d.times.start;
        const val = Math.max(0, duration);
        setSliderValue(val);
        sliderValueRef.current = val;
      }
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const interval = setInterval(() => {
      if (isSlidingRef.current) return;

      const times = timesRef.current;
      if (times && sliderValueRef.current !== -1) {
        const currentRealDuration = Math.min(Date.now(), times.end) - times.start;
        if (sliderValueRef.current >= currentRealDuration - 3000) {
          const newMax = Math.max(0, currentRealDuration);
          setSliderValue(newMax);
          sliderValueRef.current = newMax;
          fetchLeaderboard();
        } else {
          const targetTime = times.start + sliderValueRef.current;
          fetchLeaderboard(targetTime);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    sliderValueRef.current = val;
    isSlidingRef.current = true;
  };

  const handleSliderComplete = (e) => {
    isSlidingRef.current = false;
    const times = timesRef.current;
    if (!times) return;
    const targetTime = times.start + parseInt(e.target.value, 10);
    fetchLeaderboard(targetTime);
  };

  const handleDoubleClick = () => {
    const times = timesRef.current;
    if (!times) return;
    const maxDuration = Math.min(Date.now(), times.end) - times.start;
    const val = Math.max(0, maxDuration);
    setSliderValue(val);
    sliderValueRef.current = val;
    fetchLeaderboard();
  };

  if (!data || !data.times) {
    return (
      <div>
        <Navbar />
        <div className="container loading-container">
          Loading Leaderboard...
        </div>
      </div>
    );
  }

  const maxPossibleDuration = Math.max(0, Math.min(Date.now(), data.times.end) - data.times.start);
  const displayTime = new Date(data.times.start + (sliderValue === -1 ? maxPossibleDuration : sliderValue));

  const getRankClass = (rank) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="leaderboard-header">
          <h2>Leaderboard</h2>
          <p>
            Time-travel through the contest using the Persistent Segment Tree. Double-click the slider to jump to live.
          </p>
        </div>

        <div className="slider-container">
          <span className="slider-label">Time</span>
          <input
            type="range"
            min="0"
            max={maxPossibleDuration}
            step="1000"
            value={sliderValue === -1 ? maxPossibleDuration : sliderValue}
            onChange={handleSliderChange}
            onMouseUp={handleSliderComplete}
            onMouseLeave={handleSliderComplete}
            onTouchStart={() => { isSlidingRef.current = true; }}
            onTouchEnd={handleSliderComplete}
            onDoubleClick={handleDoubleClick}
            style={{ cursor: 'pointer' }}
          />
          <span className="slider-time">
            {displayTime.toLocaleTimeString()}
          </span>
        </div>

        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Username</th>
                <th style={{ textAlign: 'right', width: '120px' }}>Score</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-state">No participants yet.</td>
                </tr>
              ) : (
                data.leaderboard.map((user) => (
                  <tr key={user.username}>
                    <td className={`rank-cell ${getRankClass(user.rank)}`}>
                      #{user.rank}
                    </td>
                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{user.score}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{user.penalty}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
