import { SlashCommandBuilder, GuildMember } from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../types/index';
import { registerLink } from '../services/linkService';
import { getEffectiveChannels } from '../services/setupService';
import { McidSchema } from '../schemas/mcid';
import config from '../config/config';
import logger from '../utils/logger';

const link: Command = {
  data: new SlashCommandBuilder()
    .setName('link')
    .setDescription('DiscordアカウントとMinecraft IDを連携します')
    .addStringOption(option =>
      option
        .setName('mcid')
        .setDescription('MinecraftのプレイヤーID（例: Steve）')
        .setRequired(true),
    ),

  /** `/link <mcid>` スラッシュコマンドを処理する。 */
  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guildId = interaction.guildId;
    if (!guildId) return;

    const { listChannelId } = await getEffectiveChannels(guildId);

    if (!listChannelId) {
      await interaction.reply({
        content: '⚠️ `/link` コマンドがセットアップされていません。先に `/setup link` を実行してください。',
        ephemeral: true,
      });
      return;
    }

    const rawMcid = interaction.options.getString('mcid', true);
    const mcidResult = McidSchema.safeParse(rawMcid);
    if (!mcidResult.success) {
      await interaction.reply({
        content: `❌ ${mcidResult.error.issues[0].message}`,
        ephemeral: true,
      });
      return;
    }
    const mcid = mcidResult.data;
    await interaction.deferReply();

    try {
      const discordName = interaction.member instanceof GuildMember
        ? interaction.member.displayName
        : interaction.user.username;

      const player = await registerLink(
        interaction.client,
        listChannelId,
        guildId,
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

export default link;
