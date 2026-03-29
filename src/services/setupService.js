const { getGuildConfig, setGuildConfig } = require('../db/repositories/guildConfigRepo');
const config = require('../config/config');

/**
 * 指定コマンドのリスト表示チャンネルをギルドに保存する。
 * コマンド受付チャンネルはすべてのコマンドで共通のため config.js で管理する。
 * @param {string} guildId
 * @param {string} commandName - セットアップ対象のコマンド名（例: 'link'）
 * @param {string} listChannelId  - リスト表示チャンネルID
 */
async function setupCommand(guildId, commandName, listChannelId) {
  await setGuildConfig(guildId, `${commandName}_list_channel`, listChannelId);
}

/**
 * ギルド固有のリスト表示チャンネルを返す。未設定の場合は .env のデフォルト値を使用する。
 * コマンド受付チャンネルは config.discord.channelInputId で一元管理する。
 * @param {string} guildId
 * @returns {Promise<{ inputChannelId: string, listChannelId: string }>}
 */
async function getEffectiveChannels(guildId) {
  const listChannelId =
    (await getGuildConfig(guildId, 'link_list_channel')) ?? config.discord.channelBId;
  return { inputChannelId: config.discord.channelInputId, listChannelId };
}

module.exports = { setupCommand, getEffectiveChannels };
