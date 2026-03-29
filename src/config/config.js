require('dotenv').config();

module.exports = {
  bot: {
    // テキストコマンドのプレフィックス文字（例: '!' → `!link`、'?' → `?link`）
    // スラッシュコマンドはDiscordが '/' を管理するため、このプレフィックスはテキストコマンドにのみ適用されます
    commandPrefix: process.env.COMMAND_PREFIX || '/',
  },
  discord: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID || '1475040943240384697',
    channelInputId: process.env.CHANNEL_INPUT_ID || '1475103472709009460', // コマンド受付チャンネル
    // チャンネル制限を免除する特権ロールID（これらのロールを持つユーザーはどこでもコマンドを実行可能）
    privilegedRoleIds: [
      '1475052442482774037',
      '1475104158179921980',
      '1475104189062320298',
    ],
  },
};
