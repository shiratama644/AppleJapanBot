const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { setupCommand } = require('../services/setupService');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ボットの各機能をこのサーバー向けにセットアップします')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Minecraft連携 (/link) 機能をセットアップします。このコマンドを実行したチャンネルが連携リスト表示チャンネルになります。'),
    ),

  /**
   * `/setup <subcommand>` を処理する。
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'link') {
      try {
        await setupCommand(interaction.guildId, 'link', interaction.channelId);
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
