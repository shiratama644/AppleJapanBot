import prisma from '../prisma/client';

/**
 * guild_config から値を取得する。
 */
export async function getGuildConfig(guildId: string, key: string): Promise<string | null> {
  const record = await prisma.guildConfig.findUnique({
    where: { guildId_key: { guildId, key } },
  });
  return record?.value ?? null;
}

/**
 * guild_config に値を保存（既存は上書き）する。
 */
export async function setGuildConfig(guildId: string, key: string, value: string): Promise<void> {
  await prisma.guildConfig.upsert({
    where:  { guildId_key: { guildId, key } },
    update: { value },
    create: { guildId, key, value },
  });
}
