import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types/index';
import { setupCommand } from '../services/setupService';
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
      // DB 書き込みが 3 秒を超えることがあるため先にレスポンスを予約する
      await interaction.deferReply({ ephemeral: true });
      try {
        await setupCommand(guildId, 'link', interaction.channelId);
        await interaction.editReply({
          content: [
            `✅ \`/link\` コマンドをセットアップしました！`,
            `- コマンド受付チャンネル: ダッシュボードで設定してください`,
            `- リスト表示チャンネル:   ${interaction.channel}`,
          ].join('\n'),
        });
      } catch (err) {
        logger.error('/setup link エラー:', err);
        await interaction.editReply({
          content: '⚠️ セットアップ中にエラーが発生しました。',
        });
      }
    }
  },
};

export default setup;
