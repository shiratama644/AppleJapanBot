const { handleLinkCommand } = require('../commands/link');
const config = require('../config/config');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    if (message.guildId !== config.discord.guildId) return;

    // すべてのコマンドはチャンネルAでのみ受け付ける
    if (message.channelId !== config.discord.channelAId) return;

    if (message.content.startsWith('!link ')) {
      await handleLinkCommand(message);
    }
  },
};
