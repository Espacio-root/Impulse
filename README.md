# Impulse — Virtual Contest Simulator

A competitive programming contest simulator with real-time C++ judging and a **time-travelling leaderboard** powered by a **Persistent Segment Tree**.

Built as a course project for **Efficient Tree-Based Algorithms** by Abdullah Danish and Krritin Keshan.

## The Key Idea

In a normal contest platform, the leaderboard only shows the current state. Impulse lets you **drag a slider to any point in time** and see the exact leaderboard as it was at that moment — without storing full snapshots.

This is achieved using a **Persistent Segment Tree**: every time a user solves a problem, a new version of the tree is created by duplicating only the O(log N) nodes along the update path. All previous versions remain intact and queryable.

## Features

- **5 Algorithmic Problems** — Easy to Medium difficulty, 500–2500 points, Codeforces-style dynamic scoring
- **Monaco Code Editor** — VS Code's editor with C++ syntax highlighting, line numbers, bracket matching
- **Run Against Samples** — test your code against sample cases and see per-test input/output/verdict before submitting
- **Full Judging** — server-side `g++ -O2` compilation, execution with 2s timeout, comparison against hidden test cases
- **Time-Travelling Leaderboard** — drag the slider to view historical standings at any timestamp, powered by PST
- **Dark Theme UI** — LeetCode-inspired design (navy #0D1117, golden accent #DA9600)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- `g++` installed and in your system PATH

### Setup

```bash
git clone <repo-url>
cd Impulse
npm install
npm run dev
```

Open `http://localhost:3000`. Test cases auto-generate on first API call.

### Environment Variables (optional)

Create `.env.local` to configure contest timing:

```env
CONTEST_START_TIME="2026-04-05T18:00:00.000Z"
CONTEST_DURATION=7200
```

## Project Structure

```
src/
├── app/
│   ├── page.js                        # Login page
│   ├── globals.css                    # Complete theme & component styles
│   ├── contest/
│   │   ├── page.js                    # Dashboard — problem list, countdown timer
│   │   └── problem/[id]/page.js       # Problem page — Monaco editor + test console
│   ├── leaderboard/page.js            # Time-travelling leaderboard with slider
│   └── api/
│       ├── login/route.js             # Authenticate & init user in PST
│       ├── problems/route.js          # Fetch problems + solve status
│       ├── run/route.js               # Compile & run against sample test cases
│       ├── submit/route.js            # Judge against all test cases, update PST
│       └── leaderboard/route.js       # Query PST at any timestamp
├── components/
│   └── Navbar.js                      # Navigation bar
├── lib/
│   ├── pst.js                         # Persistent Segment Tree (build, update, traverse)
│   ├── global.js                      # Contest state, scoring logic, PST history
│   ├── judge.js                       # C++ compilation & execution engine
│   └── problems.js                    # Problem definitions with sample test cases
└── scripts/
    └── generate_tests.js              # Auto-generates 5 test cases per problem
```

## How the Persistent Segment Tree Works

```
           Root v1          Root v2 (after user scores)
           /    \            /    \
         A       B         A'      B        ← only A' is new
        / \     / \       / \     / \
      L1  L2  L3  L4   L1  L2' L3  L4      ← L2' updated, rest shared
```

- **Build**: Empty tree over domain [1, 10000] (supports up to 10K users)
- **Update**: On AC, create new root with O(log N) new nodes via path copying
- **Traverse**: Walk any version's root to extract all user states → leaderboard
- **History**: Array of `{timestamp, root}` pairs. Binary search finds the version at any query time.

**Space**: O(N + Q log N) where Q = number of updates
**Time**: O(log N) per update, O(N) per leaderboard query

## Scoring System

Codeforces-style dynamic scoring:

```
score = max(0.3 × base, base - degradation - WA_penalty)
degradation = floor(elapsedMinutes × base / 250)
WA_penalty = 50 × wrongAttempts
penalty = sum of elapsed minutes for all AC'd problems (tiebreaker)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (React 19) |
| Editor | Monaco Editor (@monaco-editor/react) |
| Styling | Vanilla CSS, custom dark theme |
| Judging | g++ via Node.js child_process |
| Data Structure | Persistent Segment Tree (from scratch) |
| State | In-memory (no database) |
