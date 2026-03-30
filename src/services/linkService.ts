import { EmbedBuilder, TextChannel } from 'discord.js';
import type { Client } from 'discord.js';
import { saveLink, getAllLinks, type Edition, type LinkedPlayer } from '../db/repositories/linkRepo';
import { getGuildConfig, setGuildConfig } from '../db/repositories/guildConfigRepo';

// Discord メッセージ1件に含められる Embed の上限
const MAX_EMBEDS_PER_MESSAGE = 10;

/** resolvePlayer の返り値型 */
export interface ResolvedPlayer {
  edition: Edition;
  headUrl: string;
}

/**
 * MCIDからJE/BEを判定し、エディション・プレイヤーヘッドURLを返す。
 * @returns プレイヤー情報、見つからなければ null
 */
export async function resolvePlayer(mcid: string): Promise<ResolvedPlayer | null> {
  // JE判定: PlayerDB API でUUIDを取得
  try {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(mcid)}`);
    if (res.ok) {
      const data = await res.json() as { success: boolean; data?: { player?: { id?: string } } };
      if (data.success && data.data?.player?.id) {
        return {
          edition: 'JE',
          headUrl: `https://mc-heads.net/avatar/${data.data.player.id}/128`,
        };
      }
    }
  } catch (_) { /* JEとして見つからなければ BE を試みる */ }

  // BE判定: PlayerDB API でXUIDを取得
  try {
    const res = await fetch(`https://playerdb.co/api/player/xbox/${encodeURIComponent(mcid)}`);
    if (res.ok) {
      const data = await res.json() as { success: boolean; data?: { player?: { id?: string } } };
      if (data.success && data.data?.player?.id) {
        return {
          edition: 'BE',
          // Floodgate仕様: BEプレイヤーはMCIDの先頭に . を付けることでJEと区別する
          headUrl: `https://mc-heads.net/avatar/.${mcid}/128`,
        };
      }
    }
  } catch (_) { /* BEとしても見つからなければ null を返す */ }

  return null;
}

/**
 * 登録済みプレイヤー一覧からEmbedの配列を生成する（最大10件/メッセージ）。
 */
export function buildEmbeds(players: LinkedPlayer[]): EmbedBuilder[] {
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
export async function updateListMessage(
  client: Client,
  listChannelId: string,
  guildId: string,
): Promise<void> {
  const channel = await client.channels.fetch(listChannelId);
  if (!(channel instanceof TextChannel)) {
    throw new Error(`チャンネル ${listChannelId} はテキストチャンネルではありません。`);
  }

  const players = await getAllLinks(guildId);
  const embeds  = buildEmbeds(players);

  const msgId = await getGuildConfig(guildId, 'link_list_message_id');
  if (msgId) {
    try {
      const msg = await channel.messages.fetch(msgId);
      await msg.edit({ embeds });
      return;
    } catch (_) {
      // メッセージが削除されている場合は新規作成へ
    }
  }

  const msg = await channel.send({ embeds });
  await setGuildConfig(guildId, 'link_list_message_id', msg.id);
}

/**
 * MCIDをDiscordユーザーと連携し、リストを更新する。
 * @returns 登録したプレイヤー情報、見つからなければ null
 */
export async function registerLink(
  client: Client,
  listChannelId: string,
  guildId: string,
  discordId: string,
  discordName: string,
  mcid: string,
): Promise<ResolvedPlayer | null> {
  const player = await resolvePlayer(mcid);
  if (!player) return null;

  await saveLink(guildId, discordId, discordName, mcid, player.edition, player.headUrl);
  await updateListMessage(client, listChannelId, guildId);

  return player;
}
