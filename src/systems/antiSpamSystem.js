/**
 * ============================================
 *   GARI BOT - Sistema: Anti-Spam / Anti-Flood / Anti-Link
 * ============================================
 */

const { createEmbed, COLORS } = require('../utils/embeds');
const { getUserData, sendLog } = require('../utils/helpers');

// Map para rastrear mensagens por usuário: userId -> [timestamps]
const spamMap = new Map();
const floodMap = new Map();

// Regex para detectar links
const LINK_REGEX = /(https?:\/\/|www\.)[^\s]+/gi;
// Links permitidos (Discord oficial, imagens, etc)
const ALLOWED_DOMAINS = ['discord.com', 'discord.gg', 'discordapp.com', 'cdn.discordapp.com', 'media.discordapp.net'];

/**
 * Aplica punição ao usuário
 */
const applyPunishment = async (message, punishment, reason) => {
  const member = message.member;
  if (!member) return;

  try {
    switch (punishment) {
      case 'warn': {
        const userData = await getUserData(member.id, message.guild.id);
        userData.warnings.push({ reason, moderatorId: message.client.user.id });
        await userData.save();
        break;
      }
      case 'mute': {
        if (member.moderatable) {
          await member.timeout(5 * 60 * 1000, reason); // 5 minutos
        }
        break;
      }
      case 'kick': {
        if (member.kickable) {
          await member.kick(reason);
        }
        break;
      }
      case 'ban': {
        if (member.bannable) {
          await member.ban({ reason });
        }
        break;
      }
    }
  } catch (error) {
    console.error('[ANTI-SPAM] Erro na punição:', error.message);
  }
};

/**
 * Verifica e aplica punição por spam (msgs repetidas)
 */
const checkSpam = async (message, config) => {
  const key = `${message.author.id}_${message.guild.id}`;
  const now = Date.now();
  const { maxMessages, timeWindow, punishment } = config.antiSpamConfig;

  // Obtém ou cria o histórico
  if (!spamMap.has(key)) spamMap.set(key, []);
  const timestamps = spamMap.get(key);

  // Adiciona o timestamp atual
  timestamps.push(now);

  // Remove timestamps fora da janela de tempo
  const recentMessages = timestamps.filter(t => now - t < timeWindow);
  spamMap.set(key, recentMessages);

  // Verifica se excedeu o limite
  if (recentMessages.length >= maxMessages) {
    // Deleta a mensagem
    await message.delete().catch(() => {});

    // Notifica no canal
    const warning = await message.channel.send({
      content: `⚠️ ${message.author}, **pare de fazer spam!** Você foi punido automaticamente.`,
    }).catch(() => null);

    // Remove a notificação após 5 segundos
    if (warning) setTimeout(() => warning.delete().catch(() => {}), 5000);

    // Aplica punição
    await applyPunishment(message, punishment, 'Anti-Spam automático');

    // Limpa o histórico deste usuário
    spamMap.set(key, []);

    // Log
    await sendLog(message.client, message.guild, createEmbed({
      color: COLORS.WARNING,
      title: '🚫 Anti-Spam Ativado',
      fields: [
        { name: '👤 Usuário', value: `${message.author.tag} (${message.author.id})`, inline: true },
        { name: '📢 Canal', value: `${message.channel}`, inline: true },
        { name: '⚡ Punição', value: punishment, inline: true },
        { name: '📊 Mensagens', value: `${recentMessages.length} em ${timeWindow / 1000}s`, inline: true },
      ],
    }));

    return true; // Flagged
  }

  return false;
};

/**
 * Verifica flood (muitas mensagens diferentes em pouco tempo)
 */
const checkFlood = async (message, config) => {
  const key = `flood_${message.author.id}_${message.guild.id}`;
  const now = Date.now();
  const { maxMessages, timeWindow, punishment } = config.antiFloodConfig;

  if (!floodMap.has(key)) floodMap.set(key, []);
  const timestamps = floodMap.get(key);

  timestamps.push(now);
  const recent = timestamps.filter(t => now - t < timeWindow);
  floodMap.set(key, recent);

  if (recent.length >= maxMessages) {
    await message.delete().catch(() => {});

    const warning = await message.channel.send({
      content: `⚠️ ${message.author}, **pare de fazer flood!**`,
    }).catch(() => null);

    if (warning) setTimeout(() => warning.delete().catch(() => {}), 5000);

    await applyPunishment(message, punishment, 'Anti-Flood automático');
    floodMap.set(key, []);

    return true;
  }

  return false;
};

/**
 * Verifica links não autorizados
 */
const checkLinks = async (message, config) => {
  if (!LINK_REGEX.test(message.content)) return false;

  // Verifica se o membro tem permissão para enviar links
  if (message.member?.permissions.has('ManageMessages')) return false;

  // Verifica se o link é de um domínio permitido
  const links = message.content.match(LINK_REGEX) || [];
  const hasBlockedLink = links.some(link => {
    return !ALLOWED_DOMAINS.some(domain => link.includes(domain));
  });

  if (hasBlockedLink) {
    await message.delete().catch(() => {});

    const warning = await message.channel.send({
      content: `🔗 ${message.author}, **links não são permitidos** neste servidor!`,
    }).catch(() => null);

    if (warning) setTimeout(() => warning.delete().catch(() => {}), 5000);

    await applyPunishment(message, 'warn', 'Envio de link não autorizado');

    await sendLog(message.client, message.guild, createEmbed({
      color: COLORS.WARNING,
      title: '🔗 Anti-Link Ativado',
      fields: [
        { name: '👤 Usuário', value: `${message.author.tag}`, inline: true },
        { name: '📢 Canal', value: `${message.channel}`, inline: true },
        { name: '🔗 Links', value: links.join('\n').substring(0, 500), inline: false },
      ],
    }));

    return true;
  }

  return false;
};

// Limpa os Maps a cada 10 minutos para evitar memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamps] of spamMap.entries()) {
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 60000) {
      spamMap.delete(key);
    }
  }
  for (const [key, timestamps] of floodMap.entries()) {
    if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > 60000) {
      floodMap.delete(key);
    }
  }
}, 600_000);

module.exports = { checkSpam, checkFlood, checkLinks };
