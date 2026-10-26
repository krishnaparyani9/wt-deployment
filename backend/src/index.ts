import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import type { AddressInfo } from 'node:net';
import app from './app';
import { connectDatabase } from './config/database';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const port = Number(process.env.PORT) || 5001;

async function startServer(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI);

  const server = app.listen(port, () => {
    const address = server.address() as AddressInfo;
    console.log(`CRM API listening on http://localhost:${address.port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Cannot start the CRM API: port ${port} is already in use. Stop the existing backend or configure another PORT in backend/.env.`);
    } else {
      console.error('Cannot start the CRM API:', error.message);
    }
    process.exit(1);
  });
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error('CRM API could not start:', message);
  process.exit(1);
});
