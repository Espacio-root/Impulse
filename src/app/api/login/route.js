import { NextResponse } from 'next/server';
import { contestState, addHistoryVersion, getContestTimes, initContest } from '@/lib/global';
import { generateAll } from '@/scripts/generate_tests';
import { update, MIN_INDEX, MAX_INDEX } from '@/lib/pst';

export async function POST(request) {
  const body = await request.json();
  const { username } = body;
  
  if (!username || username.trim() === '') {
    return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
  }

  // Initialize tests if this is the first interaction with the backend
  initContest(generateAll);

  // Ensure user exists in state
  if (!contestState.users[username]) {
    const userId = contestState.nextUserId++;
    contestState.users[username] = { id: userId, score: 0, penalty: 0, history: {} };
    
    // Add them to leaderboard explicitly initializing their node
    const currentRoot = contestState.history[contestState.history.length - 1].root;
    const newRoot = update(currentRoot, MIN_INDEX, MAX_INDEX, userId, { username, score: 0, penalty: 0 });
    addHistoryVersion(newRoot, Date.now());
  }

  return NextResponse.json({ 
    success: true, 
    userId: username,
    times: getContestTimes()
  });
}
