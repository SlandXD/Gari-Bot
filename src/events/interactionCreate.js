/**
 * ============================================
 *   GARI BOT — Evento: interactionCreate
 *   Processa slash commands, botões, selects e modals
 * ============================================
 */

const { Events } = require('discord.js');
const { errorEmbed } = require('../utils/embeds');
const ticketSystem = require('../systems/ticketSystem');
const setupCommand = require('../commands/config/setup');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {

    // ─── Slash Commands ───────────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) {
        return interaction.reply({
          embeds: [errorEmbed('Comando não encontrado', `O comando \`/${interaction.commandName}\` não existe.`)],
          ephemeral: true,
        });
      }

      // ── Cooldown ────────────────────────────────────────────────────────────
      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Map());
      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownMs = (command.cooldown || 3) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expiry = timestamps.get(interaction.user.id) + cooldownMs;
        if (now < expiry) {
          const left = ((expiry - now) / 1000).toFixed(1);
          return interaction.reply({
            embeds: [errorEmbed('Aguarde!', `Espere **${left}s** antes de usar este comando novamente.`)],
            ephemeral: true,
          });
        }
      }
      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownMs);

      // ── Execução ─────────────────────────────────────────────────────────────
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`[COMANDO] Erro em /${interaction.commandName}:`, error);
        const reply = {
          embeds: [errorEmbed('Erro Interno', 'Ocorreu um erro ao executar este comando.')],
          ephemeral: true,
        };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    // ─── Modals do /setup ─────────────────────────────────────────────────────
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('modal_')) {
        return setupCommand.handleModal(interaction).catch(console.error);
      }
    }

    // ─── Botões ───────────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Botões do painel /setup
      if (customId.startsWith('setup_')) {
        return setupCommand.handleInteraction(interaction).catch(console.error);
      }

      // Botões do sistema de tickets
      if (customId === 'ticket_open')       return ticketSystem.openTicket(interaction);
      if (customId === 'ticket_close')      return ticketSystem.closeTicket(interaction);
      if (customId === 'ticket_claim')      return ticketSystem.claimTicket(interaction);
      if (customId === 'ticket_transcript') return ticketSystem.saveTranscript(interaction);
      if (customId === 'ticket_rules') {
        return interaction.reply({
          content: [
            '📋 **Regras para abrir tickets:**',
            '• Descreva seu problema detalhadamente',
            '• Não abuse do sistema de suporte',
            '• Aguarde a equipe responder',
            '• Não encerre o ticket até o problema ser resolvido',
          ].join('\n'),
          ephemeral: true,
        });
      }
    }

    // ─── Select Menus do /setup ───────────────────────────────────────────────
    if (interaction.isStringSelectMenu() || interaction.isChannelSelectMenu() || interaction.isRoleSelectMenu()) {
      if (interaction.customId.startsWith('setup_')) {
        return setupCommand.handleInteraction(interaction).catch(console.error);
      }
    }
  },
};
