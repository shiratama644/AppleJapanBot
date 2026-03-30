import { REST, Routes } from 'discord.js';
import type { Client } from 'discord.js';
import type { BotEvent } from '../types/index';
import config from '../config/config';
import logger from '../utils/logger';

const ready: BotEvent<'ready'> = {
  name: 'ready',
  once: true,
  async execute(client: Client<true>): Promise<void> {
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

export default ready;
