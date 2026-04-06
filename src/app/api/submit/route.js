import { NextResponse } from 'next/server';
import { processVerdict, contestState, getContestTimes } from '@/lib/global';
import { judgeCplusplus } from '@/lib/judge';
import { getProblem } from '@/lib/problems';

export async function POST(request) {
  const times = getContestTimes();
  
  if (times.now > times.end) {
    return NextResponse.json({ error: 'Contest is over. Submissions are locked.' }, { status: 403 });
  }

  const { code, problemId, username } = await request.json();

  if (!code || !problemId || !username) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const problem = getProblem(problemId);
  if (!problem) {
    return NextResponse.json({ error: 'Invalid problem' }, { status: 404 });
  }

  // Execute
  const { verdict, message } = await judgeCplusplus(code, problemId);

  // Update State if valid AC
  processVerdict(username, problemId, verdict, problem.points);

  const updatedUser = contestState.users[username];

  return NextResponse.json({
    verdict,
    message,
    newScore: updatedUser.score,
    solved: updatedUser.history[problemId]?.AC || false
  });
}
