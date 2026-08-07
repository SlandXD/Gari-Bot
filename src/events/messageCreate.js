/**
 * ============================================
 *   GARI BOT - Evento: messageCreate
 *   XP, Anti-Spam, Anti-Link, Anti-Flood,
 *   Respostas Automáticas
 * ============================================
 */

const { Events } = require('discord.js');
const { getGuildConfig, getUserData, sendLog } = require('../utils/helpers');
const { createEmbed, COLORS } = require('../utils/embeds');
const antiSpamSystem = require('../systems/antiSpamSystem');
const levelSystem = require('../systems/levelSystem');

module.exports = {
  name: Events.MessageCreate,

  async execute(message, client) {
    // Ignora bots e DMs
    if (message.author.bot || !message.guild) return;

    const config = await getGuildConfig(message.guild.id);

    // ─── Anti-Spam ──────────────────────────────────────────────────────
    if (config.systems.antiSpam) {
      const flagged = await antiSpamSystem.checkSpam(message, config);
      if (flagged) return; // Mensagem já tratada pelo anti-spam
    }

    // ─── Anti-Flood ─────────────────────────────────────────────────────
    if (config.systems.antiFlood) {
      const flagged = await antiSpamSystem.checkFlood(message, config);
      if (flagged) return;
    }

    // ─── Anti-Link ──────────────────────────────────────────────────────
    if (config.systems.antiLink) {
      await antiSpamSystem.checkLinks(message, config);
    }

    // ─── Respostas Automáticas ──────────────────────────────────────────
    if (config.systems.autoResponses && config.autoResponses.length > 0) {
      const content = message.content.toLowerCase();
      for (const autoResp of config.autoResponses) {
        const trigger = autoResp.trigger.toLowerCase();
        const matches = autoResp.exactMatch
          ? content === trigger
          : content.includes(trigger);

        if (matches) {
          await message.reply({
            content: autoResp.response,
            allowedMentions: { repliedUser: false },
          }).catch(() => {});
          break; // Apenas uma resposta por mensagem
        }
      }
    }

    // ─── Sistema de XP/Níveis ───────────────────────────────────────────
    if (config.systems.levels) {
      await levelSystem.processMessage(message, config, client);
    }
  },
};
