import { getGuildConfig, setGuildConfig } from '../db/repositories/guildConfigRepo';
import config from '../config/config';

/**
 * 指定コマンドのリスト表示チャンネルをギルドに保存する。
 * コマンド受付チャンネルはすべてのコマンドで共通のため config.ts で管理する。
 */
export async function setupCommand(
  guildId: string,
  commandName: string,
  listChannelId: string,
): Promise<void> {
  await setGuildConfig(guildId, `${commandName}_list_channel`, listChannelId);
}

export interface EffectiveChannels {
  inputChannelId: string;
  listChannelId: string | null;
}

/**
 * ギルド固有のリスト表示チャンネルを返す。未設定の場合は null を返す。
 * コマンド受付チャンネルは config.discord.channelInputId で一元管理する。
 */
export async function getEffectiveChannels(guildId: string): Promise<EffectiveChannels> {
  const listChannelId = await getGuildConfig(guildId, 'link_list_channel');
  return { inputChannelId: config.discord.channelInputId, listChannelId };
}
