/**
 * ============================================
 *   GARI BOT - Evento: guildMemberAdd
 *   Boas-vindas + Auto-Role
 * ============================================
 */

const { Events } = require('discord.js');
const { createEmbed, COLORS } = require('../utils/embeds');
const { getGuildConfig, formatMessage } = require('../utils/helpers');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member, client) {
    const config = await getGuildConfig(member.guild.id);

    // ─── Auto-Role ──────────────────────────────────────────────────────
    if (config.systems.autoRole && config.roles.autoRole) {
      const role = member.guild.roles.cache.get(config.roles.autoRole);
      if (role) {
        await member.roles.add(role).catch(err => {
          console.error('[AUTO-ROLE] Erro ao adicionar cargo:', err.message);
        });
      }
    }

    // ─── Mensagem de Boas-vindas ────────────────────────────────────────
    if (config.systems.welcome && config.channels.welcomeChannel) {
      const channel = member.guild.channels.cache.get(config.channels.welcomeChannel);
      if (!channel) return;

      const welcomeMessage = formatMessage(config.messages.welcome, member);

      const embed = createEmbed({
        color: COLORS.SUCCESS,
        title: '👋 Bem-vindo(a)!',
        description: welcomeMessage,
        thumbnail: member.user.displayAvatarURL({ size: 256 }),
        fields: [
          { name: '👤 Usuário', value: member.user.tag, inline: true },
          { name: '🆔 ID', value: member.id, inline: true },
          { name: '📅 Conta criada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '👥 Membros', value: `Você é o **${member.guild.memberCount}°** membro!`, inline: false },
        ],
        footer: { text: `${member.guild.name}` },
      });

      await channel.send({
        content: `${member}`,
        embeds: [embed],
      }).catch(err => console.error('[WELCOME]', err.message));
    }

    // ─── Log de entrada ─────────────────────────────────────────────────
    if (config.systems.logs && config.channels.logs) {
      const logChannel = member.guild.channels.cache.get(config.channels.logs);
      if (logChannel) {
        const logEmbed = createEmbed({
          color: COLORS.SUCCESS,
          title: '📥 Membro Entrou',
          description: `${member} entrou no servidor`,
          thumbnail: member.user.displayAvatarURL(),
          fields: [
            { name: '👤 Tag', value: member.user.tag, inline: true },
            { name: '🆔 ID', value: member.id, inline: true },
            { name: '📅 Conta criada', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
          ],
        });
        await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
      }
    }
  },
};
