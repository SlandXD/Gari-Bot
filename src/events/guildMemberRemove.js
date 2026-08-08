/**
 * ============================================
 *   GARI BOT - Evento: guildMemberRemove
 *   Mensagem de saída + Log
 * ============================================
 */

const { Events } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const { getGuildConfig, formatMessage } = require('../utils/helpers');

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member, client) {
    const config = await getGuildConfig(member.guild.id);

    // ─── Mensagem de Saída ──────────────────────────────────────────────
    if (config.systems.leave && config.channels.leaveChannel) {
      const channel = member.guild.channels.cache.get(config.channels.leaveChannel);
      if (!channel) return;

      const leaveMessage = formatMessage(config.messages.leave, member);

      const embed = createEmbed({
        color: COLORS.ERROR,
        title: '🚪 Membro Saiu',
        description: leaveMessage,
        thumbnail: member.user.displayAvatarURL({ size: 256 }),
        fields: [
          { name: '👤 Usuário', value: member.user.tag, inline: true },
          { name: '👥 Membros restantes', value: `**${member.guild.memberCount}** membros`, inline: true },
        ],
      });

      await channel.send({ embeds: [embed] }).catch(err => console.error('[LEAVE]', err.message));
    }

    // ─── Log de saída ────────────────────────────────────────────────────
    if (config.systems.logs && config.channels.logs) {
      const logChannel = member.guild.channels.cache.get(config.channels.logs);
      if (logChannel) {
        const logEmbed = createEmbed({
          color: COLORS.ERROR,
          title: '📤 Membro Saiu',
          description: `${member.user.tag} saiu do servidor`,
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Tag', value: member.user.tag, inline: true },
            { name: '🆔 ID', value: member.id, inline: true },
            { name: '⏱️ Ficou por', value: member.joinedAt ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
          ],
        });
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
};
