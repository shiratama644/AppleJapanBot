import { CamelCasePlugin, Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { config } from 'dotenv';
import type { DB } from './types';

config();

const useSSL = process.env.DB_SSL === 'true';
const sslConfig = useSSL ? { ssl: { rejectUnauthorized: false } } : {};

// DATABASE_URL が指定されていれば接続文字列を優先して使用する。
// DATABASE_URL が未設定の場合は個別の DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME を使用する。
// 両方設定されている場合は DATABASE_URL が優先される。
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ...sslConfig }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ...sslConfig,
    };

const dialect = new PostgresDialect({
  pool: new Pool(poolConfig),
});

export const db = new Kysely<DB>({
  dialect,
  plugins: [new CamelCasePlugin()],
});
