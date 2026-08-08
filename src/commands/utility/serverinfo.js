/**
 * ============================================
 *   GARI BOT - Comando: /serverinfo
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('🏠 Mostra informações detalhadas do servidor'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.fetch(); // Atualiza os dados

    // Contagem de canais por tipo
    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;

    // Contagem de membros
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const humanCount = totalMembers - botCount;

    // Nível de boost
    const boostLevels = ['Sem Nível', 'Nível 1', 'Nível 2', 'Nível 3'];
    const boostLevel = boostLevels[guild.premiumTier] || 'Desconhecido';

    const embed = createEmbed({
      color: COLORS.PRIMARY,
      title: `🏠 ${guild.name}`,
      description: guild.description || '*Sem descrição*',
      thumbnail: guild.iconURL({ size: 256 }),
      image: guild.bannerURL({ size: 1024 }),
      fields: [
        {
          name: '👑 Dono',
          value: `<@${guild.ownerId}>`,
          inline: true,
        },
        {
          name: '🆔 ID do Servidor',
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: '📅 Criado em',
          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
          inline: true,
        },
        {
          name: '👥 Membros',
          value: `👤 Humanos: **${humanCount}**\n🤖 Bots: **${botCount}**\n📊 Total: **${totalMembers}**`,
          inline: true,
        },
        {
          name: '💬 Canais',
          value: `📝 Texto: **${textChannels}**\n🔊 Voz: **${voiceChannels}**\n📁 Categorias: **${categories}**`,
          inline: true,
        },
        {
          name: '🎭 Cargos',
          value: `**${guild.roles.cache.size}** cargos`,
          inline: true,
        },
        {
          name: '✨ Boost',
          value: `${boostLevel} • **${guild.premiumSubscriptionCount || 0}** boosts`,
          inline: true,
        },
        {
          name: '🛡️ Verificação',
          value: ['Nenhuma', 'Baixa', 'Média', 'Alta', 'Máxima'][guild.verificationLevel] || 'N/A',
          inline: true,
        },
        {
          name: '😀 Emojis',
          value: `**${guild.emojis.cache.size}** emojis`,
          inline: true,
        },
      ],
    });

    await interaction.reply({ embeds: [embed] });
  },
};
