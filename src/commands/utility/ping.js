/**
 * ============================================
 *   GARI BOT - Comando: /ping
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Verifica a latência do bot'),

  async execute(interaction) {
    // Mede o tempo de resposta
    const sent = await interaction.reply({
      embeds: [createEmbed({
        color: COLORS.INFO,
        title: '🏓 Calculando ping...',
        description: 'Aguarde um momento...',
      })],
      fetchReply: true,
    });

    const apiLatency = Math.round(interaction.client.ws.ping);
    const botLatency = sent.createdTimestamp - interaction.createdTimestamp;

    // Define cor baseada na latência
    let color = COLORS.SUCCESS;
    let status = '🟢 Excelente';
    if (apiLatency > 150) { color = COLORS.WARNING; status = '🟡 Aceitável'; }
    if (apiLatency > 300) { color = COLORS.ERROR; status = '🔴 Alto'; }

    await interaction.editReply({
      embeds: [createEmbed({
        color,
        title: '🏓 Pong!',
        description: `Conexão do **Gari Bot** com o Discord`,
        fields: [
          { name: '📡 Latência da API', value: `\`${apiLatency}ms\``, inline: true },
          { name: '🤖 Latência do Bot', value: `\`${botLatency}ms\``, inline: true },
          { name: '📊 Status', value: status, inline: true },
        ],
      })],
    });
  },
};
