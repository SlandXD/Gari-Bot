/**
 * ============================================
 *   GARI BOT - Comando: /kick
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Expulsa um usuário do servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário a ser expulso').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo da expulsão').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo informado';

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('Usuário não encontrado', 'Este usuário não está no servidor.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Ação inválida', 'Você não pode se expulsar.')], ephemeral: true });
    }

    if (!target.kickable) {
      return interaction.reply({ embeds: [errorEmbed('Sem permissão', 'Não tenho permissão para expulsar este usuário.')], ephemeral: true });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Sem permissão', 'Você não pode expulsar alguém com cargo igual ou superior ao seu.')], ephemeral: true });
    }

    try {
      await target.user.send({
        embeds: [errorEmbed('Você foi expulso!', `**Servidor:** ${interaction.guild.name}\n**Motivo:** ${reason}`)],
      }).catch(() => {});

      await target.kick(`${reason} | Por: ${interaction.user.tag}`);

      await interaction.reply({
        embeds: [successEmbed('Usuário Expulso', `**${target.user.tag}** foi expulso com sucesso!\n**Motivo:** ${reason}`)],
      });

      await sendLog(interaction.client, interaction.guild, modEmbed('kick', target.user, interaction.user, reason));

    } catch (error) {
      console.error('[KICK]', error);
      await interaction.reply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao expulsar o usuário.')], ephemeral: true });
    }
  },
};
