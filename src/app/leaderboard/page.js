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
      
      // Auto-initialize slider value on first fetch
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
        if (isSlidingRef.current) return; // Wait until they stop moving the bob
        
        const times = timesRef.current;
        if (times && sliderValueRef.current !== -1) {
            const currentRealDuration = Math.min(Date.now(), times.end) - times.start;
            // If the user's slider is relatively at the "latest" time (within 3 seconds)
            if (sliderValueRef.current >= currentRealDuration - 3000) {
               const newMax = Math.max(0, currentRealDuration);
               setSliderValue(newMax);
               sliderValueRef.current = newMax;
               fetchLeaderboard(); // fetch latest inherently
            } else {
               // Update past state
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

  if (!data || !data.times) return <div className="container"><Navbar />Loading Leaderboard...</div>;

  const maxPossibleDuration = Math.max(0, Math.min(Date.now(), data.times.end) - data.times.start);
  const displayTime = new Date(data.times.start + (sliderValue === -1 ? maxPossibleDuration : sliderValue));

  return (
    <div>
      <Navbar />
      <div className="container">
        <h2>Contest Leaderboard</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Explore the exact history precisely tracked by the Persistent Segment Tree. Double-click the slider logic bob to attach to the latest live leaderboard!
        </p>

        <div className="panel" style={{ padding: '24px 32px' }}>
          <div className="slider-container">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', width: '80px' }}>Simulate: </span>
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
            <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', minWidth: '100px', textAlign: 'right' }}>
              {displayTime.toLocaleTimeString()}
            </span>
          </div>

          <table>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Rank</th>
                <th>Username</th>
                <th style={{ textAlign: 'right' }}>Score</th>
                <th style={{ textAlign: 'right', width: '100px' }}>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {data.leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No participants yet.</td>
                </tr>
              ) : (
                data.leaderboard.map((user, idx) => (
                  <tr key={user.username}>
                    <td style={{ fontWeight: 'bold', color: user.rank === 1 ? '#fbbf24' : user.rank === 2 ? '#9ca3af' : user.rank === 3 ? '#b45309' : 'inherit' }}>
                      #{user.rank}
                    </td>
                    <td>{user.username}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{user.score}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{user.penalty}</td>
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
