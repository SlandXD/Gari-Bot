/**
 * ============================================
 *   GARI BOT - Comando: /ticket
 *   Sistema completo de tickets de suporte
 * ============================================
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionsBitField,
} = require('discord.js');
const { createEmbed, errorEmbed, successEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../../utils/embeds');
const { getGuildConfig } = require('../../utils/helpers');
const Guild = require('../../database/models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('🎟️ Sistema de tickets')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('painel')
        .setDescription('📤 Envia o painel de abertura de tickets no canal atual')
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'painel') {
      const config = await getGuildConfig(interaction.guild.id);

      if (!config.systems.tickets) {
        return interaction.reply({
          embeds: [errorEmbed('Sistema Desativado', 'O sistema de tickets está desativado.\nUse `/setup` → **Sistemas** para ativá-lo.')],
          ephemeral: true,
        });
      }

      // Embed do painel com banner
      const panelEmbed = createEmbed({
        color: COLORS.PRIMARY,
        title: '🎟️ Central de Suporte — Gari Bot',
        description: [
          '> Precisa de ajuda? Clique no botão abaixo para abrir um ticket!',
          '',
          '```ansi',
          '\u001b[1;32m📋 COMO FUNCIONA\u001b[0m',
          '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          '1️⃣  Clique em "Abrir Ticket"',
          '2️⃣  Um canal privado será criado',
          '3️⃣  Descreva seu problema',
          '4️⃣  Aguarde a equipe responder',
          '```',
          '',
          '> ⚠️ **Não abuse do sistema de tickets.**',
          '> Abra um ticket apenas quando necessário.',
        ].join('\n'),
        image: BANNER_URL,
        thumbnail: LOGO_URL,
        footer: { text: '🤖 Gari Bot • Sistema de Suporte' },
      });

      // Botão de abrir ticket
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket_open')
          .setLabel('🎟️ Abrir Ticket')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('ticket_rules')
          .setLabel('📋 Regras')
          .setStyle(ButtonStyle.Secondary),
      );

      await interaction.channel.send({ embeds: [panelEmbed], components: [row] });
      await interaction.reply({ content: '✅ Painel de tickets enviado!', ephemeral: true });
    }
  },
};
