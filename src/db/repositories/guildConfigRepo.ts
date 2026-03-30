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
 * guild_config からギルドのすべての設定をキー・バリューのオブジェクトで返す。
 */
export async function getAllGuildConfig(guildId: string): Promise<Record<string, string>> {
  const rows = await db
    .selectFrom('guildConfig')
    .select(['key', 'value'])
    .where('guildId', '=', guildId)
    .execute();
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
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
