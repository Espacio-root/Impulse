import { NextResponse } from 'next/server';
import { getProblem } from '@/lib/problems';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec, execFile } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(request) {
  const { code, problemId } = await request.json();

  if (!code || !problemId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const problem = getProblem(problemId);
  if (!problem || !problem.samples) {
    return NextResponse.json({ error: 'Invalid problem' }, { status: 404 });
  }

  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const id = crypto.randomBytes(8).toString('hex');
  const cppFile = path.join(tmpDir, `${id}.cpp`);
  const exeFile = path.join(tmpDir, `${id}.out`);

  fs.writeFileSync(cppFile, code);

  // Compile
  try {
    await execPromise(`g++ -O2 "${cppFile}" -o "${exeFile}"`);
  } catch (err) {
    try { fs.unlinkSync(cppFile); } catch(e) {}
    return NextResponse.json({
      compiled: false,
      error: 'Compilation Error',
      stderr: err.stderr?.slice(0, 500) || '',
      results: []
    });
  }

  const results = [];

  for (let i = 0; i < problem.samples.length; i++) {
    const sample = problem.samples[i];
    try {
      const output = await new Promise((resolve, reject) => {
        const child = execFile(exeFile, { timeout: 2000 }, (error, stdout, stderr) => {
          if (error) reject(error);
          else resolve(stdout);
        });
        child.stdin.write(sample.input);
        child.stdin.end();
      });

      const actual = output.trim();
      const expected = sample.expectedOutput.trim();
      const passed = actual === expected;

      results.push({
        testCase: i + 1,
        input: sample.input.trim(),
        expectedOutput: expected,
        actualOutput: actual,
        passed,
        verdict: passed ? 'AC' : 'WA'
      });
    } catch (err) {
      const isTLE = err.killed || err.signal === 'SIGTERM';
      results.push({
        testCase: i + 1,
        input: sample.input.trim(),
        expectedOutput: sample.expectedOutput.trim(),
        actualOutput: '',
        passed: false,
        verdict: isTLE ? 'TLE' : 'RTE',
        error: isTLE ? 'Time Limit Exceeded' : 'Runtime Error'
      });
    }
  }

  // Cleanup
  try { fs.unlinkSync(cppFile); } catch(e) {}
  try { fs.unlinkSync(exeFile); } catch(e) {}

  const allPassed = results.every(r => r.passed);

  return NextResponse.json({
    compiled: true,
    results,
    allPassed,
    summary: `${results.filter(r => r.passed).length}/${results.length} test cases passed`
  });
}
