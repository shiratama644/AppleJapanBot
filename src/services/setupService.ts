import { getGuildConfig, setGuildConfig } from '../db/repositories/guildConfigRepo';

/**
 * 指定コマンドのリスト表示チャンネルをギルドに保存する。
 */
export async function setupCommand(
  guildId: string,
  commandName: string,
  listChannelId: string,
): Promise<void> {
  await setGuildConfig(guildId, `${commandName}_list_channel`, listChannelId);
}

export interface EffectiveChannels {
  listChannelId: string | null;
}

/**
 * ギルド固有のリスト表示チャンネルを返す。未設定の場合は null を返す。
 */
export async function getEffectiveChannels(guildId: string): Promise<EffectiveChannels> {
  const listChannelId = await getGuildConfig(guildId, 'link_list_channel');
  return { listChannelId };
}
