import type {
  ChatInputCommandInteraction,
  ClientEvents,
  Collection,
} from 'discord.js';

/** スラッシュコマンドの定義と実行ハンドラ */
export interface Command {
  data: { name: string; toJSON(): object };
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

/** Discord.js イベントハンドラ */
export interface BotEvent<K extends keyof ClientEvents = keyof ClientEvents> {
  name: K;
  once?: boolean;
  execute(...args: ClientEvents[K]): Promise<void> | void;
}

// discord.js の Client に commands コレクションを追加する
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
  }
}
