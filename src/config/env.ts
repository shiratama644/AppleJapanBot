import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  /** Discord ボットトークン */
  DISCORD_TOKEN: z.string().min(1, '必須の環境変数 "DISCORD_TOKEN" が設定されていません。'),
  /** コマンドを有効にするギルドID（デフォルトは開発用サーバー） */
  GUILD_ID: z.string().default('1475040943240384697'),
  /** コマンド受付チャンネルID（デフォルトは開発用チャンネル） */
  CHANNEL_INPUT_ID: z.string().default('1475103472709009460'),
  /** テキストコマンドプレフィックス */
  COMMAND_PREFIX: z.string().default('/'),
  /** PostgreSQL 接続URL（例: postgresql://user:pass@host:5432/db） */
  DATABASE_URL: z.string().min(1).startsWith('postgresql://', 'DATABASE_URL は postgresql:// で始まる必要があります。').optional(),
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
