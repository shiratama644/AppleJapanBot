import { GuildMember } from 'discord.js';
import type { Interaction } from 'discord.js';
import type { BotEvent } from '../types/index';
import config from '../config/config';
import logger from '../utils/logger';
import { getGuildConfig } from '../db/repositories/guildConfigRepo';

const interactionCreate: BotEvent<'interactionCreate'> = {
  name: 'interactionCreate',
  async execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // チャンネル制限: 特権ロールを持たないユーザーは指定チャンネルでのみコマンドを実行可能
    // ギルドごとに command_input_channel が設定されている場合はそれを優先し、
    // 未設定の場合は環境変数 CHANNEL_INPUT_ID にフォールバックする
    const member = interaction.member;
    const hasPrivilegedRole = member instanceof GuildMember
      ? config.discord.privilegedRoleIds.some(id => member.roles.cache.has(id))
      : false;

    if (!hasPrivilegedRole) {
      let allowedChannelId = config.discord.channelInputId;
      if (interaction.guildId) {
        const guildChannel = await getGuildConfig(interaction.guildId, 'command_input_channel');
        if (guildChannel) allowedChannelId = guildChannel;
      }

      if (interaction.channelId !== allowedChannelId) {
        await interaction.reply({
          content: `このコマンドは <#${allowedChannelId}> でのみ使用できます。`,
          ephemeral: true,
        });
        return;
      }
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      logger.error(`コマンド /${interaction.commandName} の実行中にエラー:`, err);
      const reply = { content: '⚠️ コマンドの実行中にエラーが発生しました。', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  },
};

export default interactionCreate;
