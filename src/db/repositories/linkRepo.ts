import type { Selectable } from 'kysely';
import { db } from '../kysely';
import type { LinkedPlayersTable } from '../types';

/** MCIDのエディション種別 */
export type Edition = 'JE' | 'BE';

/** Kyselyが返す連携済みプレイヤーの型 */
export type LinkedPlayer = Selectable<LinkedPlayersTable>;

/**
 * MCIDとDiscordユーザーの連携を保存（既存は上書き）する。
 */
export async function saveLink(
  guildId: string,
  discordId: string,
  discordName: string,
  mcid: string,
  edition: Edition,
  headUrl: string,
): Promise<void> {
  await db
    .insertInto('linkedPlayers')
    .values({ guildId, discordId, discordName, mcid, edition, headUrl })
    .onConflict(oc =>
      oc.columns(['guildId', 'discordId']).doUpdateSet({ discordName, mcid, edition, headUrl }),
    )
    .execute();
}

/**
 * ギルドの連携済みプレイヤーを登録日時昇順で全件取得する。
 */
export async function getAllLinks(guildId: string): Promise<LinkedPlayer[]> {
  return db
    .selectFrom('linkedPlayers')
    .selectAll()
    .where('guildId', '=', guildId)
    .orderBy('linkedAt', 'asc')
    .execute();
}
