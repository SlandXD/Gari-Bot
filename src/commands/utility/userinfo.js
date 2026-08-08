/**
 * ============================================
 *   GARI BOT - Comando: /userinfo
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');
const { getUserData } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 Mostra informações de um usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para ver as informações')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getMember('usuario') || interaction.member;
    const user = target.user;

    // Busca dados do usuário no banco (com fallback se banco offline)
    let userData;
    try {
      userData = await getUserData(user.id, interaction.guild.id);
    } catch {
      userData = { level: 0, xp: 0, warnings: [] };
    }

    // Cargos do usuário (exceto @everyone)
    const roles = target.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString())
      .slice(0, 5); // Máx 5 cargos

    const rolesText = roles.length > 0
      ? roles.join(' ') + (target.roles.cache.size - 1 > 5 ? ` (+${target.roles.cache.size - 6} mais)` : '')
      : '*Sem cargos*';

    // Badges/status
    const statusIcons = { online: '🟢', idle: '🟡', dnd: '🔴', offline: '⚫' };
    const status = target.presence?.status || 'offline';

    const embed = createEmbed({
      color: target.displayHexColor !== '#000000' ? parseInt(target.displayHexColor.replace('#', ''), 16) : COLORS.PRIMARY,
      author: {
        name: `${user.username} (${user.id})`,
        iconURL: user.displayAvatarURL(),
      },
      thumbnail: user.displayAvatarURL({ size: 256 }),
      fields: [
        {
          name: '📅 Conta criada',
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>\n(<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
          inline: true,
        },
        {
          name: '📥 Entrou no servidor',
          value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:D>\n(<t:${Math.floor(target.joinedTimestamp / 1000)}:R>)`,
          inline: true,
        },
        {
          name: `${statusIcons[status]} Status`,
          value: status.charAt(0).toUpperCase() + status.slice(1),
          inline: true,
        },
        {
          name: '⭐ Nível / XP',
          value: `Nível **${userData.level}** • ${userData.xp} XP`,
          inline: true,
        },
        {
          name: '⚠️ Advertências',
          value: `**${userData.warnings.length}** avisos`,
          inline: true,
        },
        {
          name: '🤖 Bot',
          value: user.bot ? 'Sim' : 'Não',
          inline: true,
        },
        {
          name: `🎭 Cargos [${target.roles.cache.size - 1}]`,
          value: rolesText,
          inline: false,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
