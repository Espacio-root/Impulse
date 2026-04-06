import { NextResponse } from 'next/server';
import { contestState, getContestTimes, initContest } from '@/lib/global';
import { generateAll } from '@/scripts/generate_tests';
import { problems } from '@/lib/problems';

export async function GET(request) {
  initContest(generateAll);

  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  let solved = {};
  if (username && contestState.users[username]) {
    const history = contestState.users[username].history;
    for (const [pId, obj] of Object.entries(history)) {
       if (obj.AC) solved[pId] = true;
    }
  }

  return NextResponse.json({
    problems: problems.map(p => ({
      ...p,
      isSolved: !!solved[p.id]
    })),
    times: getContestTimes()
  });
}
