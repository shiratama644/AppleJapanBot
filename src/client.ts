import { Client, GatewayIntentBits, Collection } from 'discord.js';
import type { Command } from './types/index';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// commands コレクションをクライアントに追加（types/index.ts の module augmentation で型定義済み）
client.commands = new Collection<string, Command>();

export default client;
