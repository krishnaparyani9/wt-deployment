import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendDirectory = fileURLToPath(new URL('../', import.meta.url));
const projectDirectory = fileURLToPath(new URL('../../', import.meta.url));
const backendUrl = 'http://localhost:5001';
const frontendCommand = process.execPath;
const viteScript = path.join(projectDirectory, 'node_modules', 'vite', 'bin', 'vite.js');
const isWindows = process.platform === 'win32';
let backendProcess;
let frontendProcess;
let stopping = false;

async function isCrmBackendRunning() {
  try {
    const response = await fetch(`${backendUrl}/api/health`, { signal: AbortSignal.timeout(1000) });
    if (!response.ok) return false;
    const health = await response.json();
    return health.status === 'ok' && ['connected', 'disconnected'].includes(health.database);
  } catch {
    return false;
  }
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => server.close(() => resolve(true)));
  });
}

function stopProcess(child) {
  if (child && child.exitCode === null) child.kill('SIGTERM');
}

async function startBackend() {
  if (await isCrmBackendRunning()) {
    console.log('Reusing the CRM backend already running on port 5001.');
    return;
  }

  if (!(await isPortAvailable(5001)) && !(await isCrmBackendRunning())) {
    throw new Error('Port 5001 is occupied by a process that is not responding as the CRM API. Stop that process before starting the CRM.');
  }

  if (await isCrmBackendRunning()) {
    console.log('Reusing the CRM backend already running on port 5001.');
    return;
  }

  const npmCommand = isWindows ? 'npm.cmd' : 'npm';
  backendProcess = spawn(npmCommand, ['run', 'dev', '--workspace', '@atlas-crm/backend'], {
    cwd: projectDirectory,
    shell: isWindows,
    stdio: 'inherit',
  });

  backendProcess.once('error', (error) => {
    console.error('Could not start the CRM backend:', error.message);
  });

  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isCrmBackendRunning()) {
      console.log('CRM backend is ready on port 5001.');
      return;
    }
    if (backendProcess.exitCode !== null) {
      throw new Error('The CRM backend stopped before it became ready. Check the backend startup messages above.');
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error('The CRM backend did not become ready within 15 seconds.');
}

function shutdown(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  stopProcess(frontendProcess);
  stopProcess(backendProcess);
  process.exitCode = exitCode;
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => shutdown());
}

try {
  await startBackend();
  if (!(await isPortAvailable(5173))) {
    throw new Error('Frontend port 5173 is already in use. Close the other CRM frontend before starting another one.');
  }
  frontendProcess = spawn(frontendCommand, [viteScript, '--config', 'vite.config.ts', '--strictPort'], {
    cwd: frontendDirectory,
    stdio: 'inherit',
  });

  frontendProcess.once('error', (error) => {
    console.error('Could not start the CRM frontend:', error.message);
    shutdown(1);
  });

  frontendProcess.once('exit', (code) => shutdown(code ?? 1));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  shutdown(1);
}
