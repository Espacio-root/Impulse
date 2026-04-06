const fs = require('fs');
const path = require('path');

const PROBLEMS_DIR = path.join(process.cwd(), 'problems');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeTestCase(probId, index, input, output) {
  const probDir = path.join(PROBLEMS_DIR, probId);
  ensureDir(probDir);
  fs.writeFileSync(path.join(probDir, `input-${index}.txt`), input.trim() + '\n');
  fs.writeFileSync(path.join(probDir, `output-${index}.txt`), output.trim() + '\n');
}

function rInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateA() {
  const probId = 'A';
  writeTestCase(probId, 1, '1 2', '3');
  for (let i = 2; i <= 5; i++) {
    const a = rInt(-1000, 1000);
    const b = rInt(-1000, 1000);
    writeTestCase(probId, i, `${a} ${b}`, `${a + b}`);
  }
}

function generateB() {
  const probId = 'B';
  writeTestCase(probId, 1, '5', 'Odd');
  writeTestCase(probId, 2, '10', 'Even');
  for (let i = 3; i <= 5; i++) {
    const n = rInt(-1000, 1000);
    writeTestCase(probId, i, `${n}`, n % 2 === 0 ? 'Even' : 'Odd');
  }
}

function generateC() {
  const probId = 'C';
  writeTestCase(probId, 1, '4\n1 5 2 3', '5');
  for (let i = 2; i <= 5; i++) {
    const n = rInt(10, 100);
    const arr = Array.from({ length: n }, () => rInt(-1000, 1000));
    const max = Math.max(...arr);
    writeTestCase(probId, i, `${n}\n${arr.join(' ')}`, `${max}`);
  }
}

function generateD() {
  const probId = 'D';
  writeTestCase(probId, 1, '4 9\n2 7 11 15', 'YES');
  writeTestCase(probId, 2, '3 6\n3 1 4', 'NO');
  for (let i = 3; i <= 5; i++) {
    const n = rInt(10, 100);
    const arr = Array.from({ length: n }, () => rInt(1, 100));
    const target = rInt(1, 200);
    let ok = false;
    for (let x = 0; x < n; x++) {
      for (let y = x + 1; y < n; y++) {
        if (arr[x] + arr[y] === target) ok = true;
      }
    }
    writeTestCase(probId, i, `${n} ${target}\n${arr.join(' ')}`, ok ? 'YES' : 'NO');
  }
}

function generateE() {
  const probId = 'E';
  writeTestCase(probId, 1, '()[]{}', 'YES');
  writeTestCase(probId, 2, '([)]', 'NO');
  
  const genValid = (len) => {
    if (len === 0) return '';
    const choice = rInt(0, 2);
    if (choice === 0) return '(' + genValid(len - 1) + ')';
    if (choice === 1) return '[' + genValid(len - 1) + ']';
    return '{' + genValid(len - 1) + '}';
  };

  writeTestCase(probId, 3, genValid(5), 'YES');
  writeTestCase(probId, 4, '{[}](', 'NO');
  writeTestCase(probId, 5, '(((((((((())))))))))', 'YES');
}

function generateAll() {
  console.log("Generating test cases...");
  ensureDir(PROBLEMS_DIR);
  generateA();
  generateB();
  generateC();
  generateD();
  generateE();
  console.log("Test cases generated.");
}

module.exports = { generateAll };
