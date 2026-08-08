/**
 * ============================================
 *   GARI BOT - Comando: /leaderboard
 *   Top 10 usuários com mais XP no servidor
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');
const User = require('../../database/models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 Top 10 membros com mais XP no servidor'),

  async execute(interaction) {
    await interaction.deferReply();

    // Busca os top 10 usuários do servidor
    const topUsers = await User.find({ guildId: interaction.guild.id })
      .sort({ level: -1, xp: -1 })
      .limit(10);

    if (topUsers.length === 0) {
      return interaction.editReply({
        embeds: [createEmbed({
          color: COLORS.INFO,
          title: '🏆 Ranking Vazio',
          description: 'Nenhum usuário tem XP ainda. Comecem a conversar!',
        })],
      });
    }

    // Ícones para o top 3
    const medals = ['🥇', '🥈', '🥉'];

    const list = await Promise.all(
      topUsers.map(async (user, index) => {
        const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
        const name = member ? member.user.username : `Usuário ${user.userId}`;
        const medal = medals[index] || `**#${index + 1}**`;
        return `${medal} **${name}** — Nível \`${user.level}\` • \`${user.xp} XP\``;
      })
    );

    const embed = createEmbed({
      color: COLORS.GOLD,
      author: {
        name: `🏆  Ranking de XP  —  ${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL({ dynamic: true }) ?? undefined,
      },
      description: list.join('\n'),
      thumbnail: interaction.guild.iconURL({ size: 256 }) ?? undefined,
      footer: { text: 'Use /rank para ver sua posição exata' },
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
