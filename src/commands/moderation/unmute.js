/**
 * ============================================
 *   GARI BOT - Comando: /unmute
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Remove o silenciamento de um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário para remover o silenciamento').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo informado';

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('Usuário não encontrado', 'Este usuário não está no servidor.')], ephemeral: true });
    }

    // Verifica se o usuário está em timeout
    if (!target.communicationDisabledUntil) {
      return interaction.reply({ embeds: [errorEmbed('Não silenciado', `**${target.user.tag}** não está silenciado.`)], ephemeral: true });
    }

    try {
      await target.timeout(null, `${reason} | Por: ${interaction.user.tag}`);

      await interaction.reply({
        embeds: [successEmbed('Silenciamento Removido', `O silenciamento de **${target.user.tag}** foi removido!\n**Motivo:** ${reason}`)],
      });

      await sendLog(interaction.client, interaction.guild, modEmbed('unmute', target.user, interaction.user, reason));

    } catch (error) {
      console.error('[UNMUTE]', error);
      await interaction.reply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao remover o silenciamento.')], ephemeral: true });
    }
  },
};
