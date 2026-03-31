import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from 'dotenv';
import type { DB } from './types';

config();

const useSSL = process.env.DB_SSL === 'true';

const dialect = new PostgresDialect({
  pool: new Pool({
    ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
