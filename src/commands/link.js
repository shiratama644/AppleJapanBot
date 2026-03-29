const { SlashCommandBuilder } = require('discord.js');
const { registerLink } = require('../services/linkService');
const { getEffectiveChannels } = require('../services/setupService');
const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('DiscordアカウントとMinecraft IDを連携します')
    .addStringOption(option =>
      option
        .setName('mcid')
        .setDescription('MinecraftのプレイヤーID（例: Steve）')
        .setRequired(true),
    ),

  /**
   * `/link <mcid>` スラッシュコマンドを処理する。
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   */
  async execute(interaction) {
    const { listChannelId } = await getEffectiveChannels(interaction.guildId);

    if (!listChannelId) {
      await interaction.reply({
        content: '⚠️ `/link` コマンドがセットアップされていません。先に `/setup link` を実行してください。',
        ephemeral: true,
      });
      return;
    }

    const mcid = interaction.options.getString('mcid');
    await interaction.deferReply();

    try {
      const discordName = interaction.member?.displayName ?? interaction.user.username;
      const player = await registerLink(
        interaction.client,
        listChannelId,
        interaction.guildId,
        interaction.user.id,
        discordName,
        mcid,
      );

      if (!player) {
        await interaction.editReply('❌ MCIDが見つかりませんでした。JE・BEどちらでも存在しないIDです。');
        return;
      }

      await interaction.editReply(`✅ \`${mcid}\` (${player.edition}) を **${discordName}** として登録しました！`);
    } catch (err) {
      logger.error(`${config.bot.commandPrefix}link エラー:`, err);
      await interaction.editReply('⚠️ エラーが発生しました。しばらくしてから再試行してください。');
    }
  },
};
