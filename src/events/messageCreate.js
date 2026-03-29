const config = require('../config/config');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (message.guildId !== config.discord.guildId) return;

    // すべてのコマンドはチャンネルAでのみ受け付ける
    if (message.channelId !== config.discord.channelInputId) return;

    // config.bot.commandPrefix で始まるメッセージのみ処理する
    if (!message.content.startsWith(config.bot.commandPrefix)) return;

    // 将来のテキストコマンドをここに追加する
  },
};
