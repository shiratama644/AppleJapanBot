/**
 * DBマイグレーションスクリプト
 * 使い方: pnpm db:migrate
 *
 * 存在しないテーブルのみ作成する（既存データは変更しない）。
 */
import { db } from './kysely';
import { sql } from 'kysely';

export async function migrate(): Promise<void> {
  // linked_players テーブル
  // 複合ユニーク制約: (guild_id, discord_id)
  await db.schema
    .createTable('linked_players')
    .ifNotExists()
    .addColumn('guild_id', 'varchar(20)', col => col.notNull())
    .addColumn('discord_id', 'varchar(20)', col => col.notNull())
    .addColumn('discord_name', 'varchar(100)', col => col.notNull())
    .addColumn('mcid', 'varchar(32)', col => col.notNull())
    .addColumn('edition', 'varchar(2)', col => col.notNull())
    .addColumn('head_url', 'text', col => col.notNull())
    .addColumn('linked_at', 'timestamptz', col =>
      col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint('linked_players_guild_discord_unique', ['guild_id', 'discord_id'])
    .execute();

  // 既存テーブルに guild_id カラムが不足している場合は追加する（古いスキーマからの移行用）
  await sql`ALTER TABLE linked_players ADD COLUMN IF NOT EXISTS guild_id varchar(20) NOT NULL DEFAULT ''`.execute(db);

  // 複合ユニーク制約が存在しない場合は追加する
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'linked_players_guild_discord_unique'
      ) THEN
        ALTER TABLE linked_players
          ADD CONSTRAINT linked_players_guild_discord_unique UNIQUE (guild_id, discord_id);
      END IF;
    END $$`.execute(db);

  // 旧スキーマで discord_id 単体が主キーになっている場合はそれを削除する。
  // 複合ユニーク制約 (guild_id, discord_id) が存在する状態で古い単独PKが残っていると、
  // 同じ discord_id を別ギルドで登録しようとしたとき ON CONFLICT が機能せずに
  // 主キー違反になるため。
  await sql`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'linked_players_pkey'
          AND conrelid = 'linked_players'::regclass
      ) THEN
        ALTER TABLE linked_players DROP CONSTRAINT linked_players_pkey;
      END IF;
    END $$`.execute(db);

  // bot_config テーブル
  await db.schema
    .createTable('bot_config')
    .ifNotExists()
    .addColumn('key', 'varchar(100)', col => col.primaryKey().notNull())
    .addColumn('value', 'text', col => col.notNull())
    .execute();

  // guild_config テーブル
  // 複合ユニーク制約: (guild_id, key)
  await db.schema
    .createTable('guild_config')
    .ifNotExists()
    .addColumn('guild_id', 'varchar(20)', col => col.notNull())
    .addColumn('key', 'varchar(100)', col => col.notNull())
    .addColumn('value', 'text', col => col.notNull())
    .addUniqueConstraint('guild_config_guild_key_unique', ['guild_id', 'key'])
    .execute();

  console.log('✅ マイグレーション完了');
}

// スクリプトとして直接実行された場合のみ自動実行する
if (require.main === module) {
  migrate()
    .catch((e: unknown) => {
      console.error('❌ マイグレーション失敗:', e);
      process.exit(1);
    })
    .finally(() => db.destroy());
}
