import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types/index';
import { setupCommand } from '../services/setupService';
import config from '../config/config';
import logger from '../utils/logger';

const setup: Command = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ボットの各機能をこのサーバー向けにセットアップします')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Minecraft連携 (/link) 機能をセットアップします。このコマンドを実行したチャンネルが連携リスト表示チャンネルになります。'),
    ),

  /** `/setup <subcommand>` を処理する。 */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'link') {
      try {
        await setupCommand(guildId, 'link', interaction.channelId);
        await interaction.reply({
          content: [
            `✅ \`/link\` コマンドをセットアップしました！`,
            `- コマンド受付チャンネル: <#${config.discord.channelInputId}> (共通設定)`,
            `- リスト表示チャンネル:   ${interaction.channel}`,
          ].join('\n'),
          ephemeral: true,
        });
      } catch (err) {
        logger.error('/setup link エラー:', err);
        await interaction.reply({
          content: '⚠️ セットアップ中にエラーが発生しました。',
          ephemeral: true,
        });
      }
    }
  },
};

export default setup;
