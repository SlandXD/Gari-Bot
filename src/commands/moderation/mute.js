/**
 * ============================================
 *   GARI BOT - Comando: /mute (Timeout nativo)
 *   Usa o sistema de Timeout do Discord
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed } = require('../../utils/embeds');
const { sendLog, formatDuration } = require('../../utils/helpers');

// Opções de duração do mute
const DURATIONS = {
  '60': 60 * 1000,
  '300': 5 * 60 * 1000,
  '600': 10 * 60 * 1000,
  '1800': 30 * 60 * 1000,
  '3600': 60 * 60 * 1000,
  '21600': 6 * 60 * 60 * 1000,
  '86400': 24 * 60 * 60 * 1000,
  '259200': 3 * 24 * 60 * 60 * 1000,
  '604800': 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Silencia um usuário por um tempo determinado')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário a ser silenciado').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('duracao').setDescription('Duração do silenciamento').setRequired(true)
        .addChoices(
          { name: '1 minuto', value: '60' },
          { name: '5 minutos', value: '300' },
          { name: '10 minutos', value: '600' },
          { name: '30 minutos', value: '1800' },
          { name: '1 hora', value: '3600' },
          { name: '6 horas', value: '21600' },
          { name: '1 dia', value: '86400' },
          { name: '3 dias', value: '259200' },
          { name: '7 dias', value: '604800' },
        )
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo do silenciamento').setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const durationKey = interaction.options.getString('duracao');
    const reason = interaction.options.getString('motivo') || 'Sem motivo informado';
    const duration = DURATIONS[durationKey];

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('Usuário não encontrado', 'Este usuário não está no servidor.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Ação inválida', 'Você não pode se silenciar.')], ephemeral: true });
    }

    if (!target.moderatable) {
      return interaction.reply({ embeds: [errorEmbed('Sem permissão', 'Não tenho permissão para silenciar este usuário.')], ephemeral: true });
    }

    try {
      await target.timeout(duration, `${reason} | Por: ${interaction.user.tag}`);
      const durationText = formatDuration(duration);

      await interaction.reply({
        embeds: [successEmbed('Usuário Silenciado', `**${target.user.tag}** foi silenciado por **${durationText}**!\n**Motivo:** ${reason}`)],
      });

      await sendLog(interaction.client, interaction.guild,
        modEmbed('mute', target.user, interaction.user, reason, {
          '⏱️ Duração': durationText,
          '🔓 Termina em': `<t:${Math.floor((Date.now() + duration) / 1000)}:R>`,
        })
      );

    } catch (error) {
      console.error('[MUTE]', error);
      await interaction.reply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao silenciar o usuário.')], ephemeral: true });
    }
  },
};
