import path from 'path';
import fs from 'fs';
import client from './client';
import config from './config/config';
import type { Command, BotEvent } from './types/index';

// tsx（開発時）は .ts を、コンパイル済み（本番）は .js を読み込む
const ext = __filename.endsWith('.ts') ? '.ts' : '.js';

// src/commands/ 直下のコマンドファイルを client.commands に登録する
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(ext));

for (const file of commandFiles) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(path.join(commandsPath, file)) as { default?: Command } | Command;
  const command: Command | undefined = 'default' in mod ? mod.default : (mod as Command);
  if (command?.data) {
    client.commands.set(command.data.name, command);
  }
}

// src/events/ 配下のイベントファイルを自動登録する
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(ext));

for (const file of eventFiles) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require(path.join(eventsPath, file)) as { default?: BotEvent } | BotEvent;
  const event: BotEvent | undefined = 'default' in mod ? mod.default : (mod as BotEvent);
  if (event?.name && event?.execute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (...args: any[]) => (event.execute as (...a: any[]) => void)(...args);
    if (event.once) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client.once as any)(event.name, handler);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client.on as any)(event.name, handler);
    }
  }
}

client.login(config.discord.token);
