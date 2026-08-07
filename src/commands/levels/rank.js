/**
 * ============================================
 *   GARI BOT - Comando: /rank
 *   Mostra o nível e XP do usuário
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');
const { getUserData, progressBar } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('⭐ Veja seu nível e XP atual')
    .addUserOption(option =>
      option.setName('usuario').setDescription('Ver rank de outro usuário').setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('usuario') || interaction.user;
    const userData = await getUserData(targetUser.id, interaction.guild.id);

    // Calcula posição no ranking
    const User = require('../../database/models/User');
    const rank = await User.countDocuments({
      guildId: interaction.guild.id,
      $or: [
        { level: { $gt: userData.level } },
        { level: userData.level, xp: { $gt: userData.xp } },
      ],
    });

    const xpNeeded = userData.xpForNextLevel();
    const progress = progressBar(userData.xp, xpNeeded, 15);
    const percentage = Math.floor((userData.xp / xpNeeded) * 100);

    const embed = createEmbed({
      color: COLORS.PRIMARY,
      author: {
        name: `${targetUser.username} — Rank #${rank + 1}`,
        iconURL: targetUser.displayAvatarURL(),
      },
      description: [
        '',
        `**Nível:** \`${userData.level}\` → \`${userData.level + 1}\``,
        '',
        `\`${progress}\` **${percentage}%**`,
        '',
        `**XP:** \`${userData.xp}\` / \`${xpNeeded}\``,
        `**Mensagens:** \`${userData.totalMessages}\``,
      ].join('\n'),
      thumbnail: targetUser.displayAvatarURL({ size: 256 }),
      fields: [
        { name: '🏆 Posição', value: `**#${rank + 1}** no servidor`, inline: true },
        { name: '⭐ Nível Atual', value: `**${userData.level}**`, inline: true },
        { name: '✉️ Mensagens', value: `**${userData.totalMessages}**`, inline: true },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
