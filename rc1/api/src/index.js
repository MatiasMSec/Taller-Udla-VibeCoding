import pg from 'pg';
import { createApp } from './app.js';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Falta DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const release = process.env.RELEASE || 'RC-1';
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('Falta SESSION_SECRET');
  process.exit(1);
}
const app = createApp({ pool, release, sessionSecret });
const port = Number(process.env.PORT || 3000);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({ event: 'api.listening', release, port }));
});

async function shutdown() {
  server.close();
  await pool.end();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
