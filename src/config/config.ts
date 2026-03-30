import { env } from './env';

export interface BotConfig {
  commandPrefix: string;
}

export interface DiscordConfig {
  token: string;
  guildId: string;
  /** コマンド受付チャンネルID（すべてのコマンドで共通） */
  channelInputId: string;
  /** チャンネル制限を免除する特権ロールID一覧 */
  privilegedRoleIds: readonly string[];
}

export interface Config {
  bot: BotConfig;
  discord: DiscordConfig;
}

const config: Config = {
  bot: {
    // テキストコマンドのプレフィックス文字（将来実装用）
    // スラッシュコマンドはDiscordが '/' を管理するため、このプレフィックスはテキストコマンドにのみ適用されます
    // 現在はスラッシュコマンドのみ実装済み（messageCreate.ts 参照）
    commandPrefix: env.COMMAND_PREFIX,
  },
  discord: {
    token: env.DISCORD_TOKEN,
    guildId: env.GUILD_ID,
    channelInputId: env.CHANNEL_INPUT_ID,
    // チャンネル制限を免除する特権ロールID（これらのロールを持つユーザーはどこでもコマンドを実行可能）
    privilegedRoleIds: [
      '1475052442482774037',
      '1475104158179921980',
      '1475104189062320298',
    ],
  },
};

export default config;
