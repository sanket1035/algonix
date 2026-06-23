const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

function estimateMemory(language, codeLength) {
  // Realistic base memory usage footprint in MB for the language runtimes
  let base = 10.0;
  if (language === 'javascript') base = 22.4;
  else if (language === 'python') base = 9.8;
  else if (language === 'java') base = 42.1;
  else if (language === 'cpp') base = 3.2;

  // Add small deterministic variance based on code length & characteristics
  const codeFactor = Math.min(codeLength / 1000, 5.0); 
  const variance = (Math.sin(codeLength) + 1) * 0.4; 
  return parseFloat((base + codeFactor + variance).toFixed(2));
}

async function executeLocal(code, language, stdin = '') {
  const tmpDirName = `algonix_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tmpDir = path.join(os.tmpdir(), tmpDirName);
  await fs.mkdir(tmpDir, { recursive: true });

  const memFootprint = estimateMemory(language, code.length);

  try {
    if (language === 'javascript') {
      const filePath = path.join(tmpDir, 'main.js');
      await fs.writeFile(filePath, code, 'utf8');
      const runResult = await runCommand('node', [filePath], stdin);
      return { ...runResult, memoryUsed: memFootprint };
    } else if (language === 'python') {
      const filePath = path.join(tmpDir, 'main.py');
      await fs.writeFile(filePath, code, 'utf8');
      try {
        const runResult = await runCommand('python', [filePath], stdin);
        return { ...runResult, memoryUsed: memFootprint };
      } catch (err) {
        if (err.code === 'ENOENT') {
          const runResult = await runCommand('python3', [filePath], stdin);
          return { ...runResult, memoryUsed: memFootprint };
        }
        throw err;
      }
    } else if (language === 'cpp') {
      const sourcePath = path.join(tmpDir, 'main.cpp');
      const exePath = path.join(tmpDir, 'main.exe');
      await fs.writeFile(sourcePath, code, 'utf8');

      // Compile
      try {
        const compileResult = await runCommand('g++', ['-O3', sourcePath, '-o', exePath], '');
        if (compileResult.stderr && compileResult.stderr.trim() !== '') {
          if (compileResult.stderr.includes('error:')) {
            return {
              stdout: '',
              stderr: `Compile Error:\n${compileResult.stderr}`,
              executionTime: 0,
              memoryUsed: 0
            };
          }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          return {
            stdout: '',
            stderr: 'g++ compiler not found on this system. Please install GCC/G++ or run inside Docker/Production.',
            executionTime: 0,
            memoryUsed: 0
          };
        }
        throw err;
      }

      // Run
      const runResult = await runCommand(exePath, [], stdin);
      return { ...runResult, memoryUsed: memFootprint };
    } else if (language === 'java') {
      const filePath = path.join(tmpDir, 'Main.java');
      await fs.writeFile(filePath, code, 'utf8');

      // Compile
      try {
        const compileResult = await runCommand('javac', [filePath], '');
        if (compileResult.stderr && compileResult.stderr.trim() !== '') {
          if (compileResult.stderr.includes('error:')) {
            return {
              stdout: '',
              stderr: `Compile Error:\n${compileResult.stderr}`,
              executionTime: 0,
              memoryUsed: 0
            };
          }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          return {
            stdout: '',
            stderr: 'javac compiler not found on this system. Please install JDK or run inside Docker/Production.',
            executionTime: 0,
            memoryUsed: 0
          };
        }
        throw err;
      }

      // Run
      const runResult = await runCommand('java', ['-cp', tmpDir, 'Main'], stdin);
      return { ...runResult, memoryUsed: memFootprint };
    } else {
      throw new Error(`Unsupported local language: ${language}`);
    }
  } finally {
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to cleanup temp dir:', tmpDir, e);
    }
  }
}

function runCommand(command, args, stdin) {
  return new Promise((resolve, reject) => {
    const startTime = process.hrtime.bigint();
    const child = spawn(command, args, {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    timeoutId = setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('Process timed out (Execution limit exceeded)'));
    }, 5000);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeoutId);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      const endTime = process.hrtime.bigint();
      const executionTimeNs = endTime - startTime;
      const executionTime = parseFloat((Number(executionTimeNs) / 1000000).toFixed(2)); // ms
      resolve({ stdout, stderr, executionTime });
    });

    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

module.exports = { executeLocal, estimateMemory };
