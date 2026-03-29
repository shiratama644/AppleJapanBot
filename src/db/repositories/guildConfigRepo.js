const prisma = require('../prisma/client');

/**
 * guild_config から値を取得する。
 * @param {string} guildId
 * @param {string} key
 * @returns {Promise<string|null>}
 */
async function getGuildConfig(guildId, key) {
  const record = await prisma.guildConfig.findUnique({
    where: { guildId_key: { guildId, key } },
  });
  return record?.value ?? null;
}

/**
 * guild_config に値を保存（既存は上書き）する。
 * @param {string} guildId
 * @param {string} key
 * @param {string} value
 */
async function setGuildConfig(guildId, key, value) {
  await prisma.guildConfig.upsert({
    where:  { guildId_key: { guildId, key } },
    update: { value },
    create: { guildId, key, value },
  });
}

module.exports = { getGuildConfig, setGuildConfig };
