import { db } from '../kysely';

/**
 * guild_config から値を取得する。
 */
export async function getGuildConfig(guildId: string, key: string): Promise<string | null> {
  const record = await db
    .selectFrom('guildConfig')
    .select('value')
    .where('guildId', '=', guildId)
    .where('key', '=', key)
    .executeTakeFirst();
  return record?.value ?? null;
}

/**
 * guild_config に値を保存（既存は上書き）する。
 */
export async function setGuildConfig(guildId: string, key: string, value: string): Promise<void> {
  await db
    .insertInto('guildConfig')
    .values({ guildId, key, value })
    .onConflict(oc => oc.columns(['guildId', 'key']).doUpdateSet({ value }))
    .execute();
}
