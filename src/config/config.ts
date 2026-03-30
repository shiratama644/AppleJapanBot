import 'dotenv/config';

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

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`必須の環境変数 "${name}" が設定されていません。`);
  return value;
}

const config: Config = {
  bot: {
    // テキストコマンドのプレフィックス文字（将来実装用）
    // スラッシュコマンドはDiscordが '/' を管理するため、このプレフィックスはテキストコマンドにのみ適用されます
    // 現在はスラッシュコマンドのみ実装済み（messageCreate.ts 参照）
    commandPrefix: process.env.COMMAND_PREFIX ?? '/',
  },
  discord: {
    token: requireEnv('DISCORD_TOKEN'),
    guildId: process.env.GUILD_ID ?? '1475040943240384697',
    channelInputId: process.env.CHANNEL_INPUT_ID ?? '1475103472709009460', // コマンド受付チャンネル
    // チャンネル制限を免除する特権ロールID（これらのロールを持つユーザーはどこでもコマンドを実行可能）
    privilegedRoleIds: [
      '1475052442482774037',
      '1475104158179921980',
      '1475104189062320298',
    ],
  },
};

export default config;
