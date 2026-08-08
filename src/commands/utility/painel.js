/**
 * ============================================
 *   GARI BOT — /painel
 *   Dashboard de status do servidor (somente leitura)
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../../utils/embeds');
const { getGuildConfig, formatDuration } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('painel')
    .setDescription('📊  Status e configurações ativas do Gari Bot neste servidor'),

  async execute(interaction) {
    await interaction.deferReply();

    const { client, guild } = interaction;
    let config;
    try {
      config = await getGuildConfig(guild.id);
    } catch {
      config = { systems: {}, channels: {}, roles: {} };
    }

    const s       = config.systems;
    const c       = config.channels;
    const r       = config.roles;
    const uptime  = formatDuration(client.uptime);
    const ping    = Math.round(client.ws.ping);
    const bots    = guild.members.cache.filter(m => m.user.bot).size;
    const humans  = guild.memberCount - bots;

    const bool = (v) => v ? '`🟢`' : '`🔴`';
    const ch   = (id) => id ? `<#${id}>` : '`—`';
    const ro   = (id) => id ? `<@&${id}>` : '`—`';

    const embed = createEmbed({
      color: COLORS.PRIMARY,
      author: {
        name: `📊  Painel de Status  —  ${guild.name}`,
        iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
      },
      description: [
        '```ansi',
        '\u001b[1;34m  GARI BOT  •  Dashboard\u001b[0m',
        `\u001b[0;37m  ${guild.name}\u001b[0m`,
        '```',
      ].join('\n'),
      image: BANNER_URL ?? undefined,
      fields: [
        // ── Bot ──────────────────────────────────────────────────────────────
        {
          name: '🤖  Bot',
          value: [
            `⏰ Uptime: \`${uptime}\``,
            `📡 Ping: \`${ping}ms\``,
            `🌐 Servidores: \`${client.guilds.cache.size}\``,
          ].join('\n'),
          inline: true,
        },
        // ── Servidor ─────────────────────────────────────────────────────────
        {
          name: '🏠  Servidor',
          value: [
            `👤 Membros: \`${humans}\``,
            `🤖 Bots: \`${bots}\``,
            `💬 Canais: \`${guild.channels.cache.size}\``,
            `🎭 Cargos: \`${guild.roles.cache.size}\``,
          ].join('\n'),
          inline: true,
        },
        { name: '\u200B', value: '\u200B', inline: false },
        // ── Módulos ───────────────────────────────────────────────────────────
        {
          name: '⚙️  Módulos',
          value: [
            `${bool(s.welcome)} Boas-vindas`,
            `${bool(s.leave)} Saída`,
            `${bool(s.autoRole)} Auto-Role`,
            `${bool(s.levels)} Níveis/XP`,
            `${bool(s.logs)} Logs`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🛡️  Proteção',
          value: [
            `${bool(s.antiSpam)} Anti-Spam`,
            `${bool(s.antiLink)} Anti-Link`,
            `${bool(s.antiFlood)} Anti-Flood`,
            `${bool(s.tickets)} Tickets`,
            `${bool(s.autoResponses)} Auto-Resp`,
          ].join('\n'),
          inline: true,
        },
        // ── Canais ────────────────────────────────────────────────────────────
        {
          name: '📢  Canais Configurados',
          value: [
            `📋 Logs: ${ch(c.logs)}`,
            `👋 Boas-vindas: ${ch(c.welcomeChannel)}`,
            `🚪 Saída: ${ch(c.leaveChannel)}`,
            `🎟️ Tickets: ${ch(c.ticketCategory)}`,
            `⭐ Level Up: ${ch(c.levelUp)}`,
          ].join('\n'),
          inline: true,
        },
        // ── Cargos ────────────────────────────────────────────────────────────
        {
          name: '🎭  Cargos Configurados',
          value: [
            `🤖 Auto-Role: ${ro(r.autoRole)}`,
            `👮 Staff: ${ro(r.staffRole)}`,
          ].join('\n'),
          inline: true,
        },
      ],
      footer: {
        text: 'Gari Bot  •  Use /setup para alterar as configurações',
        iconURL: LOGO_URL ?? undefined,
      },
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
