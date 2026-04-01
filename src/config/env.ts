import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  /** Discord ボットトークン */
  DISCORD_TOKEN: z.string().min(1, '必須の環境変数 "DISCORD_TOKEN" が設定されていません。'),
  /** テキストコマンドプレフィックス */
  COMMAND_PREFIX: z.string().default('/'),
  /**
   * PostgreSQL 接続URL（例: postgresql://user:pass@host:35272/db）
   * DB_HOST 等の個別変数が設定されていない場合に使用される。
   */
  DATABASE_URL: z.string().min(1).startsWith('postgresql://', 'DATABASE_URL は postgresql:// で始まる必要があります。').optional(),
  /** DB接続ホスト（DATABASE_URL の代わりに使用できる個別変数） */
  DB_HOST: z.string().min(1).optional(),
  /** DB接続ポート番号（デフォルト: 5432） */
  DB_PORT: z.coerce.number().int().positive().default(5432),
  /** DBユーザー名 */
  DB_USER: z.string().min(1).optional(),
  /** DBパスワード */
  DB_PASSWORD: z.string().optional(),
  /** DB名 */
  DB_NAME: z.string().min(1).optional(),
  /** PostgreSQL SSL 接続を有効にするか（本番環境では true、ローカルでは false） */
  DB_SSL: z.enum(['true', 'false']).default('false'),
  /** Webダッシュボードのポート番号（デフォルト: 3000） */
  DASHBOARD_PORT: z.coerce.number().int().positive().default(3000),
  /** セッション署名用シークレット（ダッシュボード有効化に必須） */
  SESSION_SECRET: z.string().min(1).optional(),
  /** Discord OAuth2 アプリのクライアントID */
  DISCORD_CLIENT_ID: z.string().min(1).optional(),
  /** Discord OAuth2 アプリのクライアントシークレット */
  DISCORD_CLIENT_SECRET: z.string().min(1).optional(),
  /** Discord OAuth2 コールバックURL（例: http://localhost:3000/auth/callback） */
  DISCORD_REDIRECT_URI: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * 起動時に環境変数をバリデーションする。
 * 必須項目が欠けている場合はプロセスを即終了する。
 */
function parseEnv(): Env {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    const messages = result.error.issues.map(i => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    console.error(`[ERROR] 環境変数のバリデーションに失敗しました:\n${messages}`);
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
