/**
 * ============================================
 *   GARI BOT - Comando: /ban
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { sendLog } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Bane um usuário do servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário a ser banido').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo do banimento').setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('dias').setDescription('Dias de mensagens a deletar (0-7)').setMinValue(0).setMaxValue(7).setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo') || 'Sem motivo informado';
    const days = interaction.options.getInteger('dias') || 0;

    // Validações
    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('Usuário não encontrado', 'O usuário especificado não está neste servidor.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Ação inválida', 'Você não pode se banir.')], ephemeral: true });
    }

    if (!target.bannable) {
      return interaction.reply({ embeds: [errorEmbed('Sem permissão', 'Não tenho permissão para banir este usuário. Verifique a hierarquia de cargos.')], ephemeral: true });
    }

    if (target.roles.highest.position >= interaction.member.roles.highest.position && interaction.guild.ownerId !== interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Sem permissão', 'Você não pode banir alguém com cargo igual ou superior ao seu.')], ephemeral: true });
    }

    try {
      // Tenta notificar o usuário antes de banir
      await target.user.send({
        embeds: [errorEmbed('Você foi banido!', `**Servidor:** ${interaction.guild.name}\n**Motivo:** ${reason}\n**Moderador:** ${interaction.user.tag}`)],
      }).catch(() => {}); // Ignora se o DM estiver fechado

      // Executa o ban
      await target.ban({ deleteMessageSeconds: days * 86400, reason: `${reason} | Por: ${interaction.user.tag}` });

      // Resposta de sucesso
      await interaction.reply({
        embeds: [successEmbed('Usuário Banido', `**${target.user.tag}** foi banido com sucesso!\n**Motivo:** ${reason}`)],
      });

      // Envia log
      await sendLog(interaction.client, interaction.guild,
        modEmbed('ban', target.user, interaction.user, reason, {
          '🗑️ Msgs deletadas': `${days} dia(s)`,
        })
      );

    } catch (error) {
      console.error('[BAN]', error);
      await interaction.reply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao banir o usuário.')], ephemeral: true });
    }
  },
};
