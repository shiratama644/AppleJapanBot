const { EmbedBuilder } = require('discord.js');
const { saveLink, getAllLinks, getConfig, setConfig } = require('../db/repositories/linkRepo');

// Discord メッセージ1件に含められる Embed の上限
const MAX_EMBEDS_PER_MESSAGE = 10;

/**
 * MCIDからJE/BEを判定し、エディション・プレイヤーヘッドURLを返す。
 * @param {string} mcid - 検索するMinecraft ID
 * @returns {Promise<{ edition: 'JE'|'BE', headUrl: string } | null>}
 */
async function resolvePlayer(mcid) {
  // JE判定: PlayerDB API でUUIDを取得
  try {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(mcid)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.player?.id) {
        return {
          edition: 'JE',
          headUrl: `https://mc-heads.net/avatar/${data.data.player.id}/128`,
        };
      }
    }
  } catch (_) {}

  // BE判定: PlayerDB API でXUIDを取得
  try {
    const res = await fetch(`https://playerdb.co/api/player/xbox/${encodeURIComponent(mcid)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data?.player?.id) {
        return {
          edition: 'BE',
          // Floodgate仕様: BEプレイヤーはMCIDの先頭に . を付けることでJEと区別する
          headUrl: `https://mc-heads.net/avatar/.${mcid}/128`,
        };
      }
    }
  } catch (_) {}

  return null;
}

/**
 * 登録済みプレイヤー一覧からEmbedの配列を生成する（最大10件/メッセージ）。
 * @param {Array<import('@prisma/client').LinkedPlayer>} players - 連携済みプレイヤーの配列
 * @returns {import('discord.js').EmbedBuilder[]}
 */
function buildEmbeds(players) {
  if (players.length === 0) {
    return [
      new EmbedBuilder()
        .setTitle('Minecraft 連携リスト')
        .setDescription('まだ誰も登録されていません。')
        .setColor(0x2b2d31),
    ];
  }

  return players.slice(0, MAX_EMBEDS_PER_MESSAGE).map(p =>
    new EmbedBuilder()
      .setTitle(p.mcid)
      .setDescription(p.discordName)
      .addFields({ name: 'エディション', value: p.edition, inline: true })
      .setThumbnail(p.headUrl)
      .setColor(p.edition === 'JE' ? 0x5865f2 : 0x57f287),
  );
}

/**
 * チャンネルBの連携リストメッセージを更新（なければ新規作成）する。
 */
async function updateListMessage(client, channelBId) {
  const channelB = await client.channels.fetch(channelBId);
  const players  = await getAllLinks();
  const embeds   = buildEmbeds(players);

  const msgId = await getConfig('list_message_id');
  if (msgId) {
    try {
      const msg = await channelB.messages.fetch(msgId);
      await msg.edit({ embeds });
      return;
    } catch (_) {
      // メッセージが削除されている場合は新規作成へ
    }
  }

  const msg = await channelB.send({ embeds });
  await setConfig('list_message_id', msg.id);
}

/**
 * MCIDをDiscordユーザーと連携し、リストを更新する。
 * @returns {{ edition: 'JE'|'BE', headUrl: string } | null} 登録したプレイヤー情報、見つからなければ null
 */
async function registerLink(client, channelBId, discordId, discordName, mcid) {
  const player = await resolvePlayer(mcid);
  if (!player) return null;

  await saveLink(discordId, discordName, mcid, player.edition, player.headUrl);
  await updateListMessage(client, channelBId);

  return player;
}

module.exports = { registerLink, updateListMessage };
