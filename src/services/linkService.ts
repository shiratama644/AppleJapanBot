import { EmbedBuilder, TextChannel } from 'discord.js';
import type { Client } from 'discord.js';
import { saveLink, getAllLinks, type Edition, type LinkedPlayer } from '../db/repositories/linkRepo';
import { getGuildConfig, setGuildConfig } from '../db/repositories/guildConfigRepo';
import { PlayerDbResponseSchema } from '../schemas/playerdb';
import logger from '../utils/logger';

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
      const parsed = PlayerDbResponseSchema.safeParse(await res.json());
      if (parsed.success && parsed.data.success && parsed.data.data?.player?.id) {
        return {
          edition: 'JE',
          headUrl: `https://mc-heads.net/avatar/${parsed.data.data.player.id}/128`,
        };
      }
    }
  } catch (err) {
    logger.warn(`JE判定 API エラー (mcid=${mcid}):`, err);
  }

  // BE判定: PlayerDB API でXUIDを取得
  try {
    const res = await fetch(`https://playerdb.co/api/player/xbox/${encodeURIComponent(mcid)}`);
    if (res.ok) {
      const parsed = PlayerDbResponseSchema.safeParse(await res.json());
      if (parsed.success && parsed.data.success && parsed.data.data?.player?.id) {
        return {
          edition: 'BE',
          // Floodgate仕様: BEプレイヤーはMCIDの先頭に . を付けることでJEと区別する
          headUrl: `https://mc-heads.net/avatar/.${mcid}/128`,
        };
      }
    }
  } catch (err) {
    logger.warn(`BE判定 API エラー (mcid=${mcid}):`, err);
  }

  return null;
}

/**
 * 登録済みプレイヤー一覧を10件ずつのページに分割し、Embed 配列の配列を返す。
 * 空の場合は「まだ誰も登録されていません」を含む1ページを返す。
 */
export function buildEmbedPages(players: LinkedPlayer[]): EmbedBuilder[][] {
  if (players.length === 0) {
    return [[
      new EmbedBuilder()
        .setTitle('Minecraft 連携リスト')
        .setDescription('まだ誰も登録されていません。')
        .setColor(0x2b2d31),
    ]];
  }

  const pages: EmbedBuilder[][] = [];
  for (let i = 0; i < players.length; i += MAX_EMBEDS_PER_MESSAGE) {
    pages.push(
      players.slice(i, i + MAX_EMBEDS_PER_MESSAGE).map(p =>
        new EmbedBuilder()
          .setTitle(p.mcid)
          .setDescription(p.discordName)
          .addFields({ name: 'エディション', value: p.edition, inline: true })
          .setThumbnail(p.headUrl)
          .setColor(p.edition === 'JE' ? 0x5865f2 : 0x57f287),
      ),
    );
  }
  return pages;
}

/**
 * チャンネルの連携リストメッセージを更新する。
 * ページ数に合わせてメッセージを追加・編集・削除し、IDをカンマ区切りで保存する。
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
  const pages   = buildEmbedPages(players);

  // 既存メッセージIDの読み込み（カンマ区切り、旧形式の単一IDにも対応）
  const stored     = await getGuildConfig(guildId, 'link_list_message_id');
  const existingIds = stored ? stored.split(',') : [];

  const newIds: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const embeds = pages[i];
    if (i < existingIds.length) {
      try {
        const msg = await channel.messages.fetch(existingIds[i]);
        await msg.edit({ embeds });
        newIds.push(existingIds[i]);
      } catch (err) {
        // メッセージが削除されている場合は新規作成
        logger.warn(`リストメッセージの取得に失敗しました (id=${existingIds[i]}):`, err);
        const msg = await channel.send({ embeds });
        newIds.push(msg.id);
      }
    } else {
      const msg = await channel.send({ embeds });
      newIds.push(msg.id);
    }
  }

  // ページ数が減った場合、余分なメッセージを削除する
  for (let i = pages.length; i < existingIds.length; i++) {
    try {
      const msg = await channel.messages.fetch(existingIds[i]);
      await msg.delete();
    } catch (err) {
      logger.warn(`余分なリストメッセージの削除に失敗しました (id=${existingIds[i]}):`, err);
    }
  }

  await setGuildConfig(guildId, 'link_list_message_id', newIds.join(','));
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
