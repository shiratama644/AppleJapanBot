const config = require('../config/config');
const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    // チャンネル制限: 特権ロールを持たないユーザーは CHANNEL_INPUT_ID でのみコマンドを実行可能
    const hasPrivilegedRole = config.discord.privilegedRoleIds.some(
      id => interaction.member?.roles?.cache?.has(id),
    );
    if (!hasPrivilegedRole && interaction.channelId !== config.discord.channelInputId) {
      await interaction.reply({
        content: `このコマンドは <#${config.discord.channelInputId}> でのみ使用できます。`,
        ephemeral: true,
      });
      return;
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
