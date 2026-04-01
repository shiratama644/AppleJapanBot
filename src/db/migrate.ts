/**
 * DBマイグレーションスクリプト
 * 使い方: pnpm db:migrate
 *
 * 存在しないテーブルのみ作成する（既存データは変更しない）。
 */
import { db } from './kysely';
import { sql } from 'kysely';

async function migrate(): Promise<void> {
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

migrate()
  .catch((e: unknown) => {
    console.error('❌ マイグレーション失敗:', e);
    process.exit(1);
  })
  .finally(() => db.destroy());
