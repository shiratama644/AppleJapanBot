const prisma = require('../prisma/client');

/**
 * MCIDとDiscordユーザーの連携を保存（既存は上書き）する。
 */
async function saveLink(discordId, discordName, mcid, edition, headUrl) {
  await prisma.linkedPlayer.upsert({
    where:  { discordId },
    update: { discordName, mcid, edition, headUrl },
    create: { discordId, discordName, mcid, edition, headUrl },
  });
}

/**
 * 連携済みプレイヤーを登録日時昇順で全件取得する。
 */
async function getAllLinks() {
  return prisma.linkedPlayer.findMany({
    orderBy: { linkedAt: 'asc' },
  });
}

/**
 * bot_config から値を取得する。
 */
async function getConfig(key) {
  const record = await prisma.botConfig.findUnique({ where: { key } });
  return record?.value ?? null;
}

/**
 * bot_config に値を保存（既存は上書き）する。
 */
async function setConfig(key, value) {
  await prisma.botConfig.upsert({
    where:  { key },
    update: { value },
    create: { key, value },
  });
}

module.exports = { saveLink, getAllLinks, getConfig, setConfig };
