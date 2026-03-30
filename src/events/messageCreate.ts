import type { Message } from 'discord.js';
import type { BotEvent } from '../types/index';
import config from '../config/config';

const messageCreate: BotEvent<'messageCreate'> = {
  name: 'messageCreate',
  async execute(message: Message): Promise<void> {
    if (message.author.bot) return;

    // config.bot.commandPrefix で始まるメッセージのみ処理する
    if (!message.content.startsWith(config.bot.commandPrefix)) return;

    // 将来のテキストコマンドをここに追加する
  },
};

export default messageCreate;
