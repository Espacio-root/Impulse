# Virtual Contest Simulator

A modern, Codeforces/LeetCode styled competitive programming simulator featuring real-time local C++ judging and a rolling history leaderboard powered natively by a **Persistent Segment Tree**.

## Features

- **Virtual Contest**: Complete mock contest with 5 classic algorithmic problems.
- **Modern UI**: An aesthetic dark mode UI imitating LeetCode/Codeforces, avoiding external heavy UI libraries (built with Vanilla CSS).
- **C++ Integrated Judging**: A local mock judge that compiles and strictly runs code testing against generated `inputs` and `outputs` inside secure temporary containers.
- **Time Travelling Leaderboard**: The star feature of the platform. By utilizing a **Persistent Segment Tree**, the system tracks the exact standings. You can drag a playback timeline to see how the leaderboard transformed at any given timestamp.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) >= 18
- `g++` strictly installed and accessible in system path. The judge uses standard `child_process` execution to compile (`g++ -O2`).

### Installation
1. Clone the project or install dependencies:
```bash
npm install
```

2. (Optional) Run `.env.local` to dictate the duration.
```env
CONTEST_START_TIME="2026-04-05T18:00:00.000Z" # Using ISO Format
CONTEST_DURATION=7200 # In seconds
```

3. Run the development server:
```bash
npm run dev
```

4. Head over to `http://localhost:3000`. Test cases will automatically generate in `problems/` directory on your first interaction with the Next.js API.

## Architecture

- **`src/lib/pst.js`**: The pure ES6 implementation of an Order-based Persistent Segment Tree. Each time a user successfully solves a problem, they migrate nodes, duplicating only `O(log N)` depth history, ensuring perfectly immutable history fetches for any moment in time.
- **`src/lib/judge.js`**: Takes user submitted code from the frontend, compiles them locally using host `g++`, reads dynamically generated scenarios, and streams input while enforcing process timeouts.
