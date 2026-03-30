import type { LinkedPlayer } from '@prisma/client';
import prisma from '../prisma/client';

/** MCIDのエディション種別 */
export type Edition = 'JE' | 'BE';

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
  await prisma.linkedPlayer.upsert({
    where:  { guildId_discordId: { guildId, discordId } },
    update: { discordName, mcid, edition, headUrl },
    create: { guildId, discordId, discordName, mcid, edition, headUrl },
  });
}

/**
 * ギルドの連携済みプレイヤーを登録日時昇順で全件取得する。
 */
export async function getAllLinks(guildId: string): Promise<LinkedPlayer[]> {
  return prisma.linkedPlayer.findMany({
    where:   { guildId },
    orderBy: { linkedAt: 'asc' },
  });
}
