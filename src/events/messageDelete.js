/**
 * ============================================
 *   GARI BOT - Evento: messageDelete
 *   Log de mensagens deletadas
 * ============================================
 */

const { Events, AuditLogEvent } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const { getGuildConfig } = require('../utils/helpers');

module.exports = {
  name: Events.MessageDelete,

  async execute(message, client) {
    // Ignora bots, DMs e mensagens sem conteúdo
    if (message.author?.bot || !message.guild || !message.content) return;

    const config = await getGuildConfig(message.guild.id);
    if (!config.systems.logs || !config.channels.logs) return;

    const logChannel = message.guild.channels.cache.get(config.channels.logs);
    if (!logChannel) return;

    // Tenta descobrir quem deletou via Audit Log
    let deletedBy = 'Desconhecido';
    try {
      await new Promise(r => setTimeout(r, 1000)); // Aguarda o audit log
      const logs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MessageDelete,
      });
      const entry = logs.entries.first();
      if (entry && entry.target.id === message.author.id && (Date.now() - entry.createdTimestamp) < 5000) {
        deletedBy = entry.executor.tag;
      }
    } catch {}

    const embed = createEmbed({
      color: COLORS.ERROR,
      title: '🗑️ Mensagem Deletada',
      fields: [
        { name: '👤 Autor', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: '📢 Canal', value: `${message.channel}`, inline: true },
        { name: '🛡️ Deletada por', value: deletedBy, inline: true },
        {
          name: '💬 Conteúdo',
          value: message.content.length > 1024
            ? message.content.substring(0, 1021) + '...'
            : message.content || '*Sem texto (arquivo/embed)*',
          inline: false,
        },
      ],
      footer: { text: `ID: ${message.id}` },
    });

    await logChannel.send({ embeds: [embed] }).catch(() => {});
  },
};
