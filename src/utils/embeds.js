/**
 * ============================================
 *   GARI BOT - Utilitário de Embeds
 *   Tema: Preto e Verde Neon 🤖
 * ============================================
 */

const { EmbedBuilder } = require('discord.js');

// ─── Cores do tema Gari Bot ───────────────────────────────────────────────────
const COLORS = {
  PRIMARY: 0x00FF41,    // Verde neon principal
  SUCCESS: 0x00FF41,    // Verde (sucesso)
  ERROR: 0xFF0000,      // Vermelho (erro)
  WARNING: 0xFFFF00,    // Amarelo (aviso)
  INFO: 0x00BFFF,       // Azul claro (informação)
  MUTED: 0x555555,      // Cinza (desativado)
  TICKET: 0x00FF41,     // Verde neon (tickets)
};

// URL do banner do Gari Bot (imagem hospedada ou local)
const BANNER_URL = 'https://i.imgur.com/placeholder-gari-banner.png'; // Substitua pela URL real
const LOGO_URL = 'https://i.imgur.com/placeholder-gari-logo.png';     // Substitua pela URL real

/**
 * Cria um embed padrão com o tema do Gari Bot
 */
const createEmbed = (options = {}) => {
  const embed = new EmbedBuilder()
    .setColor(options.color || COLORS.PRIMARY)
    .setTimestamp();

  if (options.title) embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields) embed.addFields(options.fields);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.image) embed.setImage(options.image);
  if (options.footer) embed.setFooter(options.footer);
  if (options.author) embed.setAuthor(options.author);
  if (options.url) embed.setURL(options.url);

  // Footer padrão com logo
  if (!options.footer) {
    embed.setFooter({
      text: '🤖 Gari Bot • O robô que limpa o chat!',
      iconURL: LOGO_URL,
    });
  }

  return embed;
};

/**
 * Embed de sucesso (verde)
 */
const successEmbed = (title, description) => {
  return createEmbed({
    color: COLORS.SUCCESS,
    title: `✅ ${title}`,
    description,
  });
};

/**
 * Embed de erro (vermelho)
 */
const errorEmbed = (title, description) => {
  return createEmbed({
    color: COLORS.ERROR,
    title: `❌ ${title}`,
    description,
  });
};

/**
 * Embed de aviso (amarelo)
 */
const warningEmbed = (title, description) => {
  return createEmbed({
    color: COLORS.WARNING,
    title: `⚠️ ${title}`,
    description,
  });
};

/**
 * Embed de informação (azul)
 */
const infoEmbed = (title, description) => {
  return createEmbed({
    color: COLORS.INFO,
    title: `ℹ️ ${title}`,
    description,
  });
};

/**
 * Embed de moderação (verde neon com detalhes)
 */
const modEmbed = (action, target, moderator, reason, extra = {}) => {
  const icons = {
    ban: '🔨',
    kick: '👢',
    mute: '🔇',
    unmute: '🔊',
    warn: '⚠️',
    unban: '✅',
  };

  return createEmbed({
    color: COLORS.ERROR,
    title: `${icons[action] || '🛡️'} Ação de Moderação: ${action.toUpperCase()}`,
    fields: [
      { name: '👤 Usuário', value: `${target.tag || target} (${target.id || 'N/A'})`, inline: true },
      { name: '🛡️ Moderador', value: `${moderator.tag || moderator}`, inline: true },
      { name: '📋 Motivo', value: reason || 'Sem motivo informado', inline: false },
      ...Object.entries(extra).map(([name, value]) => ({ name, value: String(value), inline: true })),
    ],
  });
};

module.exports = {
  COLORS,
  BANNER_URL,
  LOGO_URL,
  createEmbed,
  successEmbed,
  errorEmbed,
  warningEmbed,
  infoEmbed,
  modEmbed,
};
