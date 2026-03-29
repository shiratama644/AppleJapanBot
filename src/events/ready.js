const { REST, Routes } = require('discord.js');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  async execute(client) {
    logger.info(`🤖 Logged in as ${client.user.tag}`);

    // スラッシュコマンドをギルドに登録する
    const commands = [...client.commands.values()].map(cmd => cmd.data.toJSON());
    const rest = new REST().setToken(config.discord.token);

    try {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, config.discord.guildId),
        { body: commands },
      );
      logger.info(`✅ スラッシュコマンドを登録しました (${commands.length}件)`);
    } catch (err) {
      logger.error('スラッシュコマンドの登録に失敗しました:', err);
    }
  },
};
