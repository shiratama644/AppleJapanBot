const { getGuildConfig, setGuildConfig } = require('../db/repositories/guildConfigRepo');
const config = require('../config/config');

/**
 * 指定コマンドのチャンネル設定をギルドに保存する。
 * @param {string} guildId
 * @param {string} commandName - セットアップ対象のコマンド名（例: 'link'）
 * @param {string} inputChannelId - コマンド受付チャンネルID
 * @param {string} listChannelId  - リスト表示チャンネルID
 */
async function setupCommand(guildId, commandName, inputChannelId, listChannelId) {
  await setGuildConfig(guildId, `${commandName}_input_channel`, inputChannelId);
  await setGuildConfig(guildId, `${commandName}_list_channel`,  listChannelId);
}

/**
 * ギルド固有のチャンネル設定を返す。未設定の場合は .env のデフォルト値を使用する。
 * @param {string} guildId
 * @returns {Promise<{ inputChannelId: string, listChannelId: string }>}
 */
async function getEffectiveChannels(guildId) {
  const inputChannelId =
    (await getGuildConfig(guildId, 'link_input_channel')) ?? config.discord.channelAId;
  const listChannelId =
    (await getGuildConfig(guildId, 'link_list_channel')) ?? config.discord.channelBId;
  return { inputChannelId, listChannelId };
}

module.exports = { setupCommand, getEffectiveChannels };
