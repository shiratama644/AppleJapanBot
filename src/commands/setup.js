const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { setupCommand } = require('../services/setupService');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('ボットの各機能をこのサーバー向けにセットアップします')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('link')
        .setDescription('Minecraft連携 (/link) 機能をセットアップします')
        .addChannelOption(option =>
          option
            .setName('input_channel')
            .setDescription('/link コマンドを受け付けるチャンネル')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        )
        .addChannelOption(option =>
          option
            .setName('list_channel')
            .setDescription('連携リストを表示するチャンネル')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true),
        ),
    ),

  /**
   * `/setup <subcommand>` を処理する。
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'link') {
      const inputChannel = interaction.options.getChannel('input_channel');
      const listChannel  = interaction.options.getChannel('list_channel');

      try {
        await setupCommand(interaction.guildId, 'link', inputChannel.id, listChannel.id);
        await interaction.reply({
          content: [
            `✅ \`/link\` コマンドをセットアップしました！`,
            `- コマンド受付チャンネル: ${inputChannel}`,
            `- リスト表示チャンネル:   ${listChannel}`,
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
