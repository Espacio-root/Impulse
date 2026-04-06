import { NextResponse } from 'next/server';
import { contestState } from '@/lib/global';
import { traverse, MIN_INDEX, MAX_INDEX } from '@/lib/pst';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetTime = searchParams.get('timestamp') 
    ? parseInt(searchParams.get('timestamp'), 10)
    : Date.now();

  let selectedRoot = contestState.history[0].root;
  let selectedTimestamp = contestState.history[0].timestamp;
  
  // Find the exact snapshot matching timestamp <= targetTime
  // Since history is ordered by time, we find the highest possible valid time
  let low = 0;
  let high = contestState.history.length - 1;
  let bestIdx = 0;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (contestState.history[mid].timestamp <= targetTime) {
      bestIdx = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  selectedRoot = contestState.history[bestIdx].root;
  selectedTimestamp = contestState.history[bestIdx].timestamp;

  // Extract from the PST via universal leaf traversal
  const rawBoard = traverse(selectedRoot, MIN_INDEX, MAX_INDEX);
  
  // Custom sorting rules matching Codeforces style leaderboard:
  // 1. Higher score first
  // 2. Lower penalty time second
  rawBoard.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.penalty - b.penalty;
  });

  let currentRank = 1;
  const formatted = rawBoard.map((item, idx) => {
    // If scores and penalties match, they share absolute rank
    if (idx > 0 && item.score === rawBoard[idx-1].score && item.penalty === rawBoard[idx-1].penalty) {
       // share same rank
    } else {
       currentRank = idx + 1;
    }
    
    return {
      rank: currentRank,
      username: item.username,
      score: item.score,
      penalty: item.penalty
    };
  });

  return NextResponse.json({
    leaderboard: formatted,
    timestamp: selectedTimestamp,
    times: {
      start: contestState.startTime,
      end: contestState.startTime + contestState.durationSeconds * 1000,
      now: Date.now()
    }
  });
}
