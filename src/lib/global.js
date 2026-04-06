const { build, update, MIN_INDEX, MAX_INDEX } = require('./pst');

if (!global.contestState) {
  global.contestState = {
    history: [{ timestamp: Date.now(), root: build() }],
    users: {}, // username -> { id, score, penalty, history: { problemId: { WAs: 0, AC: false } } }
    nextUserId: MIN_INDEX,
    startTime: process.env.CONTEST_START_TIME ? new Date(process.env.CONTEST_START_TIME).getTime() : Date.now(),
    durationSeconds: process.env.CONTEST_DURATION ? parseInt(process.env.CONTEST_DURATION, 10) : 2 * 60 * 60,
    isInitialized: false,
  };
}

const contestState = global.contestState;

function addHistoryVersion(newRoot, timestamp = Date.now()) {
  contestState.history.push({
    timestamp,
    root: newRoot
  });
}

function processVerdict(username, problemId, verdict, points) {
  if (!contestState.users[username]) {
    const userId = contestState.nextUserId++;
    contestState.users[username] = { 
      id: userId, 
      score: 0, 
      penalty: 0, 
      history: {} 
    };
    const currentRoot = contestState.history[contestState.history.length - 1].root;
    const newRoot = update(currentRoot, MIN_INDEX, MAX_INDEX, userId, { username, score: 0, penalty: 0 });
    addHistoryVersion(newRoot);
  }
  
  let user = contestState.users[username];
  if (!user.history[problemId]) {
    user.history[problemId] = { WAs: 0, AC: false };
  }

  // If already accepted, ignore subsequent submissions for scoring
  if (user.history[problemId].AC) return;
  
  const now = Date.now();
  
  if (verdict === 'AC') {
    const elapsedMinutes = Math.floor((now - contestState.startTime) / 60000);
    const degradation = Math.floor(elapsedMinutes * (points / 250));
    const waPenalty = user.history[problemId].WAs * 50;
    
    const minPoints = Math.floor(0.3 * points);
    const awarded = Math.max(minPoints, points - degradation - waPenalty);
    
    user.score += awarded;
    // Classic Codeforces penalty is often just time, or implicitly handled inside score. 
    // Usually Codeforces does not break ties using a separate penalty if using dynamic points. 
    // They just sum points. Tie breaking is by who reached score first (which we can emulate 
    // by keeping track of the time they got the points as a secondary penalty metric).
    // Let's set penalty to elapsedMinutes for this specific problem as a secondary sort.
    user.penalty += elapsedMinutes;
    
    user.history[problemId].AC = true;
    
    const currentRoot = contestState.history[contestState.history.length - 1].root;
    const newRoot = update(currentRoot, MIN_INDEX, MAX_INDEX, user.id, { 
      username, 
      score: user.score, 
      penalty: user.penalty 
    });
    // The timestamp stored is `now` so the segment tree timeline perfectly aligns with exactly when AC happened.
    addHistoryVersion(newRoot, now);
    
  } else if (verdict === 'WA') {
    user.history[problemId].WAs += 1;
    // WRONG answers on Codeforces don't update Leaderboard root, they just decrement potential points
    // upon future AC. But wait, we could update the root anyway if we wanted to show attempts. 
    // For now we just mutate backend state since score hasn't actually dropped.
  }
}

function initContest(generator) {
  if (!contestState.isInitialized) {
    if (generator) generator();
    contestState.isInitialized = true;
    console.log("Contest initialized.");
  }
}

function getContestTimes() {
  return {
    start: contestState.startTime,
    end: contestState.startTime + contestState.durationSeconds * 1000,
    now: Date.now()
  };
}

module.exports = {
  contestState,
  addHistoryVersion,
  processVerdict,
  initContest,
  getContestTimes,
  MIN_INDEX,
  MAX_INDEX
};
