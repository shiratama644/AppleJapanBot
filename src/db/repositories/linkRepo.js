const prisma = require('../prisma/client');

/**
 * MCIDとDiscordユーザーの連携を保存（既存は上書き）する。
 * @param {string} guildId
 */
async function saveLink(guildId, discordId, discordName, mcid, edition, headUrl) {
  await prisma.linkedPlayer.upsert({
    where:  { guildId_discordId: { guildId, discordId } },
    update: { discordName, mcid, edition, headUrl },
    create: { guildId, discordId, discordName, mcid, edition, headUrl },
  });
}

/**
 * ギルドの連携済みプレイヤーを登録日時昇順で全件取得する。
 * @param {string} guildId
 */
async function getAllLinks(guildId) {
  return prisma.linkedPlayer.findMany({
    where:   { guildId },
    orderBy: { linkedAt: 'asc' },
  });
}

module.exports = { saveLink, getAllLinks };
