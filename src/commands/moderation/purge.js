/**
 * ============================================
 *   GARI BOT - Comando: /purge
 *   Deleta mensagens em massa
 * ============================================
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('🗑️ Deleta várias mensagens de uma vez')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(option =>
      option.setName('quantidade').setDescription('Quantidade de mensagens (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)
    )
    .addUserOption(option =>
      option.setName('usuario').setDescription('Deletar apenas mensagens deste usuário').setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('quantidade');
    const targetUser = interaction.options.getUser('usuario');

    await interaction.deferReply({ ephemeral: true });

    try {
      // Busca as mensagens
      let messages = await interaction.channel.messages.fetch({ limit: 100 });

      // Filtra por usuário se especificado
      if (targetUser) {
        messages = messages.filter(m => m.author.id === targetUser.id);
      }

      // Pega apenas a quantidade solicitada
      messages = messages.first(amount);

      // Filtra mensagens com menos de 14 dias (limitação do Discord)
      const twoWeeksAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const deletable = messages.filter(m => m.createdTimestamp > twoWeeksAgo);

      if (deletable.length === 0) {
        return interaction.editReply({
          embeds: [errorEmbed('Sem mensagens', 'Não há mensagens deletáveis (mensagens com mais de 14 dias não podem ser deletadas em massa).')],
        });
      }

      await interaction.channel.bulkDelete(deletable, true);

      await interaction.editReply({
        embeds: [successEmbed('Mensagens Deletadas', `**${deletable.length}** mensagens foram deletadas${targetUser ? ` de ${targetUser.tag}` : ''}!`)],
      });

    } catch (error) {
      console.error('[PURGE]', error);
      await interaction.editReply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao deletar as mensagens.')] });
    }
  },
};
