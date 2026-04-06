const fs = require('fs');
const path = require('path');
const { execFile, exec } = require('child_process');
const crypto = require('crypto');
const util = require('util');

const execPromise = util.promisify(exec);

async function judgeCplusplus(code, problemId) {
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  
  const id = crypto.randomBytes(8).toString('hex');
  const cppFile = path.join(tmpDir, `${id}.cpp`);
  const exeFile = path.join(tmpDir, `${id}.out`);
  
  fs.writeFileSync(cppFile, code);
  
  // Compile
  try {
    await execPromise(`g++ -O2 ${cppFile} -o ${exeFile}`);
  } catch (err) {
    // Compilation error counts as RTE for simplicity as requested, 
    // but message will say compilation error.
    return { verdict: 'RTE', message: 'Compilation Error' };
  }
  
  const probDir = path.join(process.cwd(), 'problems', problemId);
  if (!fs.existsSync(probDir)) {
      return { verdict: 'RTE', message: 'System error: problem test cases not found' };
  }
  
  const files = fs.readdirSync(probDir);
  const inputFiles = files.filter(f => f.startsWith('input-')).sort();
  
  let passed = 0;
  let total = inputFiles.length;
  
  for (let inFile of inputFiles) {
    const index = inFile.split('-')[1].split('.')[0];
    const outFile = `output-${index}.txt`;
    
    const inputContent = fs.readFileSync(path.join(probDir, inFile), 'utf-8');
    const expectedOutput = fs.readFileSync(path.join(probDir, outFile), 'utf-8').trim();
    
    try {
      const output = await new Promise((resolve, reject) => {
        let child = execFile(exeFile, { timeout: 2000 }, (error, stdout, stderr) => {
          if (error) {
            reject(error);
          } else {
            resolve(stdout);
          }
        });
        child.stdin.write(inputContent);
        child.stdin.end();
      });
      
      const actualOutput = output.trim();
      
      if (actualOutput !== expectedOutput) {
        return { verdict: 'WA', message: `Wrong Answer on test ${index}` };
      }
      passed++;
      
    } catch (err) {
      if (err.killed || err.signal === 'SIGTERM') {
         return { verdict: 'RTE', message: `Time Limit Exceeded on test ${index}` };
      }
      return { verdict: 'RTE', message: `Runtime Error on test ${index}` };
    }
  }
  
  // Cleanup
  try {
    fs.unlinkSync(cppFile);
    fs.unlinkSync(exeFile);
  } catch(e) {}
  
  return { verdict: 'AC', message: `Passed ${passed}/${total} tests` };
}

module.exports = { judgeCplusplus };
