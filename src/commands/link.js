const { registerLink } = require('../services/linkService');
const config = require('../config/config');
const logger = require('../utils/logger');

/**
 * `!link <MCID>` コマンドを処理する。
 * MCIDを解決してDBに保存し、連携リストを更新する。
 */
async function handleLinkCommand(message) {
  const mcid = message.content.slice('!link '.length).trim();
  if (!mcid) {
    await message.reply('使い方: `!link <MCID>`');
    return;
  }

  const loadingMsg = await message.reply('⏳ プレイヤー情報を確認中...');

  try {
    const discordName = message.member?.displayName ?? message.author.username;
    const player = await registerLink(
      message.client,
      config.discord.channelBId,
      message.author.id,
      discordName,
      mcid,
    );

    if (!player) {
      await loadingMsg.edit('❌ MCIDが見つかりませんでした。JE・BEどちらでも存在しないIDです。');
      return;
    }

    await loadingMsg.edit(`✅ \`${mcid}\` (${player.edition}) を **${discordName}** として登録しました！`);
  } catch (err) {
    logger.error('!link エラー:', err);
    await loadingMsg.edit('⚠️ エラーが発生しました。しばらくしてから再試行してください。');
  }
}

module.exports = { handleLinkCommand };
