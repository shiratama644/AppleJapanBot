require('dotenv').config();

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID || '1475040943240384697',
    channelAId: process.env.CHANNEL_A_ID || '1475103472709009460', // コマンド受付チャンネル
    channelBId: process.env.CHANNEL_B_ID || '1479758785492029651', // 連携リスト表示チャンネル
  },
};
