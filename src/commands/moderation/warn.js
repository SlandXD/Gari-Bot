/**
 * ============================================
 *   GARI BOT - Comando: /warn, /warnings, /clearwarns
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, warningEmbed, modEmbed } = require('../../utils/embeds');
const { getUserData, sendLog } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Avisa um usuário')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(option =>
      option.setName('usuario').setDescription('Usuário a ser avisado').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('motivo').setDescription('Motivo do aviso').setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario');
    const reason = interaction.options.getString('motivo');

    if (!target) {
      return interaction.reply({ embeds: [errorEmbed('Usuário não encontrado', 'Este usuário não está no servidor.')], ephemeral: true });
    }

    if (target.id === interaction.user.id) {
      return interaction.reply({ embeds: [errorEmbed('Ação inválida', 'Você não pode se avisar.')], ephemeral: true });
    }

    try {
      // Salva o aviso no banco
      const userData = await getUserData(target.id, interaction.guild.id);
      userData.warnings.push({
        reason,
        moderatorId: interaction.user.id,
      });
      await userData.save();

      const warnCount = userData.warnings.length;

      // Notifica o usuário
      await target.user.send({
        embeds: [warningEmbed('Você recebeu um aviso!', `**Servidor:** ${interaction.guild.name}\n**Motivo:** ${reason}\n**Total de avisos:** ${warnCount}`)],
      }).catch(() => {});

      await interaction.reply({
        embeds: [successEmbed('Aviso Emitido', `**${target.user.tag}** recebeu um aviso!\n**Motivo:** ${reason}\n**Total de avisos:** ${warnCount}`)],
      });

      // Log
      const { sendLog } = require('../../utils/helpers');
      // Log
      await sendLog(interaction.client, interaction.guild,
        modEmbed('warn', target.user, interaction.user, reason, {
          '⚠️ Total de avisos': `${warnCount}`,
        })
      );

      // Punição automática a cada 3 avisos
      if (warnCount % 3 === 0 && target.moderatable) {
        await target.timeout(30 * 60 * 1000, `Punição automática: ${warnCount} avisos`);
        await interaction.followUp({
          embeds: [warningEmbed('Punição Automática', `**${target.user.tag}** atingiu **${warnCount} avisos** e foi silenciado por 30 minutos automaticamente.`)],
        });
      }

    } catch (error) {
      console.error('[WARN]', error);
      await interaction.reply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao emitir o aviso.')], ephemeral: true });
    }
  },
};
