/**
 * ============================================
 *   GARI BOT - Evento: interactionCreate
 *   Processa todos os slash commands e botões
 * ============================================
 */

const { InteractionType, Events } = require('discord.js');
const { errorEmbed } = require('../utils/embeds');
const ticketSystem = require('../systems/ticketSystem');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction, client) {

    // ─── Slash Commands ───────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        return interaction.reply({
          embeds: [errorEmbed('Comando não encontrado', `O comando \`/${interaction.commandName}\` não foi encontrado.`)],
          ephemeral: true,
        });
      }

      // Sistema de cooldown por comando/usuário
      const { cooldowns } = client;
      if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Map());
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name);
      const cooldownAmount = (command.cooldown || 3) * 1000; // Padrão: 3 segundos

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = ((expirationTime - now) / 1000).toFixed(1);
          return interaction.reply({
            embeds: [errorEmbed('Aguarde!', `Você precisa esperar **${timeLeft}s** para usar este comando novamente.`)],
            ephemeral: true,
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      // Executa o comando
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`[COMANDO] Erro em /${interaction.commandName}:`, error);

        const errorReply = {
          embeds: [errorEmbed('Erro Interno', 'Ocorreu um erro ao executar este comando. Tente novamente mais tarde.')],
          ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorReply);
        } else {
          await interaction.reply(errorReply);
        }
      }
    }

    // ─── Botões ───────────────────────────────────────────────────────────
    if (interaction.isButton()) {
      const { customId } = interaction;

      // Botões do sistema de tickets
      if (customId === 'ticket_open') {
        await ticketSystem.openTicket(interaction);
      }

      if (customId === 'ticket_close') {
        await ticketSystem.closeTicket(interaction);
      }

      if (customId === 'ticket_claim') {
        await ticketSystem.claimTicket(interaction);
      }

      if (customId === 'ticket_rules') {
        await interaction.reply({
          content: [
            '📋 **Regras para abrir tickets:**',
            '• Descreva seu problema detalhadamente',
            '• Não abuse do sistema',
            '• Aguarde a equipe responder',
            '• Não encerre o ticket até resolver o problema',
          ].join('\n'),
          ephemeral: true,
        });
      }

      if (customId === 'ticket_transcript') {
        await ticketSystem.saveTranscript(interaction);
      }
    }

    // ─── Select Menus ─────────────────────────────────────────────────────
    if (interaction.isStringSelectMenu()) {
      // Os select menus de /help são tratados diretamente no comando
    }
  },
};
