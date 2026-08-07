/**
 * ============================================
 *   GARI BOT - Comando: /painel
 *   Dashboard interno com status e estatísticas
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../../utils/embeds');
const { getGuildConfig, formatDuration } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('📊 Mostra o painel de controle do Gari Bot'),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const guild = interaction.guild;
    const config = await getGuildConfig(guild.id);

    // Uptime do bot
    const uptime = formatDuration(client.uptime);

    // Ping da API
    const apiPing = Math.round(client.ws.ping);

    // Estatísticas do servidor
    const memberCount = guild.memberCount;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;
    const channelCount = guild.channels.cache.size;
    const roleCount = guild.roles.cache.size;

    // Sistemas ativos
    const systems = config.systems;
    const systemStatus = (active) => active ? '🟢 Ativo' : '🔴 Inativo';

    const embed = createEmbed({
      color: COLORS.PRIMARY,
      title: '📊 Painel de Controle — Gari Bot',
      description: [
        '```ansi',
        '\u001b[1;32m  🤖 GARI BOT v1.0.0\u001b[0m',
        '\u001b[0;32m  O robô que limpa o chat e mantém a ordem!\u001b[0m',
        '```',
      ].join('\n'),
      image: BANNER_URL,
      thumbnail: LOGO_URL,
      fields: [
        // Status do bot
        {
          name: '🖥️ Status do Bot',
          value: [
            `⏰ **Uptime:** \`${uptime}\``,
            `📡 **Ping:** \`${apiPing}ms\``,
            `🌐 **Servidores:** \`${client.guilds.cache.size}\``,
            `👥 **Total de membros:** \`${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}\``,
          ].join('\n'),
          inline: true,
        },
        // Estatísticas do servidor
        {
          name: `🏠 ${guild.name}`,
          value: [
            `👤 **Membros:** \`${memberCount - botCount}\``,
            `🤖 **Bots:** \`${botCount}\``,
            `💬 **Canais:** \`${channelCount}\``,
            `🎭 **Cargos:** \`${roleCount}\``,
          ].join('\n'),
          inline: true,
        },
        // Separador
        { name: '\u200B', value: '\u200B', inline: false },
        // Sistemas ativos
        {
          name: '⚙️ Sistemas Configurados',
          value: [
            `📝 **Logs:** ${systemStatus(systems.logs)}`,
            `👋 **Boas-vindas:** ${systemStatus(systems.welcome)}`,
            `🚪 **Saída:** ${systemStatus(systems.leave)}`,
            `🎭 **Auto-Role:** ${systemStatus(systems.autoRole)}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🛡️ Proteção',
          value: [
            `🚫 **Anti-Spam:** ${systemStatus(systems.antiSpam)}`,
            `🔗 **Anti-Link:** ${systemStatus(systems.antiLink)}`,
            `💧 **Anti-Flood:** ${systemStatus(systems.antiFlood)}`,
            `🎟️ **Tickets:** ${systemStatus(systems.tickets)}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🧩 Extras',
          value: [
            `⭐ **Níveis/XP:** ${systemStatus(systems.levels)}`,
            `🤖 **Auto-Respostas:** ${systemStatus(systems.autoResponses)}`,
          ].join('\n'),
          inline: true,
        },
        // Canais configurados
        {
          name: '📢 Canais Configurados',
          value: [
            `📋 **Logs:** ${config.channels.logs ? `<#${config.channels.logs}>` : '`Não configurado`'}`,
            `👋 **Boas-vindas:** ${config.channels.welcomeChannel ? `<#${config.channels.welcomeChannel}>` : '`Não configurado`'}`,
            `🎟️ **Tickets:** ${config.channels.ticketCategory ? `<#${config.channels.ticketCategory}>` : '`Não configurado`'}`,
          ].join('\n'),
          inline: false,
        },
      ],
      footer: {
        text: `🤖 Gari Bot • Use /configurar para alterar as configurações`,
        iconURL: LOGO_URL,
      },
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
