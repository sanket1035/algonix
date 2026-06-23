const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function executeLocal(code, language, stdin = '') {
  // Generate a unique temporary directory name
  const tmpDirName = `algonix_run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const tmpDir = path.join(os.tmpdir(), tmpDirName);
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    if (language === 'javascript') {
      const filePath = path.join(tmpDir, 'main.js');
      await fs.writeFile(filePath, code, 'utf8');
      return await runCommand('node', [filePath], stdin);
    } else if (language === 'python') {
      const filePath = path.join(tmpDir, 'main.py');
      await fs.writeFile(filePath, code, 'utf8');
      // Try 'python' first, fall back to 'python3' if it fails
      try {
        return await runCommand('python', [filePath], stdin);
      } catch (err) {
        if (err.code === 'ENOENT') {
          return await runCommand('python3', [filePath], stdin);
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
          // Check if it's an actual compiler warning or error
          if (compileResult.stderr.includes('error:')) {
            return {
              stdout: '',
              stderr: `Compile Error:\n${compileResult.stderr}`
            };
          }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          return {
            stdout: '',
            stderr: 'g++ compiler not found on this system. Please install GCC/G++ or run inside Docker/Production.'
          };
        }
        throw err;
      }

      // Run
      return await runCommand(exePath, [], stdin);
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
              stderr: `Compile Error:\n${compileResult.stderr}`
            };
          }
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          return {
            stdout: '',
            stderr: 'javac compiler not found on this system. Please install JDK or run inside Docker/Production.'
          };
        }
        throw err;
      }

      // Run. Java needs to run with -cp pointing to the temp directory
      return await runCommand('java', ['-cp', tmpDir, 'Main'], stdin);
    } else {
      throw new Error(`Unsupported local language: ${language}`);
    }
  } finally {
    // Cleanup temporary directory and files
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error('Failed to cleanup temp dir:', tmpDir, e);
    }
  }
}

function runCommand(command, args, stdin) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';
    let timeoutId;

    // 5 seconds execution timeout
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
      resolve({ stdout, stderr });
    });

    // Write input if provided
    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

module.exports = { executeLocal };
