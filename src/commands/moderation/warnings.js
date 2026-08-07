/**
 * ============================================
 *   GARI BOT - Comando: /warnings e /clearwarns
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createEmbed, successEmbed, errorEmbed, COLORS } = require('../../utils/embeds');
const { getUserData } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('📋 Gerencia os avisos de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand(sub =>
      sub.setName('ver')
        .setDescription('Ver todos os avisos de um usuário')
        .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('limpar')
        .setDescription('Limpa todos os avisos de um usuário')
        .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remover')
        .setDescription('Remove um aviso específico')
        .addUserOption(o => o.setName('usuario').setDescription('Usuário').setRequired(true))
        .addIntegerOption(o => o.setName('numero').setDescription('Número do aviso').setRequired(true).setMinValue(1))
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const target = interaction.options.getUser('usuario');
    const userData = await getUserData(target.id, interaction.guild.id);

    if (subcommand === 'ver') {
      if (userData.warnings.length === 0) {
        return interaction.reply({
          embeds: [createEmbed({
            color: COLORS.SUCCESS,
            title: '✅ Sem Avisos',
            description: `**${target.tag}** não possui nenhum aviso registrado.`,
          })],
        });
      }

      const warnList = userData.warnings.map((w, i) => {
        const mod = interaction.guild.members.cache.get(w.moderatorId);
        const modName = mod ? mod.user.tag : `ID: ${w.moderatorId}`;
        const date = `<t:${Math.floor(new Date(w.date).getTime() / 1000)}:d>`;
        return `**#${i + 1}** • ${date} • Por ${modName}\n> ${w.reason}`;
      }).join('\n\n');

      return interaction.reply({
        embeds: [createEmbed({
          color: COLORS.WARNING,
          title: `⚠️ Avisos de ${target.username} (${userData.warnings.length})`,
          description: warnList,
          thumbnail: target.displayAvatarURL(),
        })],
      });
    }

    if (subcommand === 'limpar') {
      const count = userData.warnings.length;
      userData.warnings = [];
      await userData.save();

      return interaction.reply({
        embeds: [successEmbed('Avisos Limpos', `Todos os **${count} avisos** de **${target.tag}** foram removidos.`)],
      });
    }

    if (subcommand === 'remover') {
      const num = interaction.options.getInteger('numero');
      if (num > userData.warnings.length) {
        return interaction.reply({ embeds: [errorEmbed('Aviso não encontrado', `Este usuário só tem **${userData.warnings.length}** avisos.`)], ephemeral: true });
      }

      userData.warnings.splice(num - 1, 1);
      await userData.save();

      return interaction.reply({
        embeds: [successEmbed('Aviso Removido', `O aviso **#${num}** de **${target.tag}** foi removido.`)],
      });
    }
  },
};
