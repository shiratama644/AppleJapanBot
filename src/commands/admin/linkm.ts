import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  GuildMember,
} from 'discord.js';
import type { ChatInputCommandInteraction } from 'discord.js';
import type { Command } from '../../types/index';
import { registerLink } from '../../services/linkService';
import { getEffectiveChannels } from '../../services/setupService';
import { McidSchema } from '../../schemas/mcid';
import config from '../../config/config';
import logger from '../../utils/logger';

const linkm: Command = {
  data: new SlashCommandBuilder()
    .setName('linkm')
    .setDescription('[管理者] 指定したユーザーのDiscordアカウントとMinecraft IDを手動で連携します')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('連携するDiscordユーザー')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('mcid')
        .setDescription('MinecraftのプレイヤーID（例: Steve）')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  /** `/linkm <user> <mcid>` スラッシュコマンドを処理する。 */
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

    const targetUser = interaction.options.getUser('user', true);
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
      const targetMember = interaction.guild?.members.cache.get(targetUser.id);
      const discordName = targetMember instanceof GuildMember
        ? targetMember.displayName
        : targetUser.username;

      const player = await registerLink(
        interaction.client,
        listChannelId,
        guildId,
        targetUser.id,
        discordName,
        mcid,
      );

      if (!player) {
        await interaction.editReply(`❌ MCIDが見つかりませんでした。JE・BEどちらでも存在しないIDです。`);
        return;
      }

      await interaction.editReply(
        `✅ \`${mcid}\` (${player.edition}) を **${discordName}** (<@${targetUser.id}>) として登録しました！`,
      );
    } catch (err) {
      logger.error(`${config.bot.commandPrefix}linkm エラー:`, err);
      await interaction.editReply('⚠️ エラーが発生しました。しばらくしてから再試行してください。');
    }
  },
};

export default linkm;
