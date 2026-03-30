import type { Generated } from 'kysely';

export interface LinkedPlayersTable {
  guildId: string;
  discordId: string;
  discordName: string;
  mcid: string;
  edition: string;
  headUrl: string;
  linkedAt: Generated<Date>;
}

export interface BotConfigTable {
  key: string;
  value: string;
}

export interface GuildConfigTable {
  guildId: string;
  key: string;
  value: string;
}

export interface DB {
  linkedPlayers: LinkedPlayersTable;
  botConfig: BotConfigTable;
  guildConfig: GuildConfigTable;
}
