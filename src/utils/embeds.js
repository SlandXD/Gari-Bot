/**
 * ============================================
 *   GARI BOT - Utilitário de Embeds
 *   Tema: Dark Elegante com Accent Neon 💎
 * ============================================
 */

const { EmbedBuilder } = require('discord.js');

// ─── Paleta de cores elegante ─────────────────────────────────────────────────
const COLORS = {
  PRIMARY:  0x5865F2,   // Blurple Discord — identidade principal
  SUCCESS:  0x57F287,   // Verde suave — sucesso
  ERROR:    0xED4245,   // Vermelho suave — erro
  WARNING:  0xFEE75C,   // Amarelo — aviso
  INFO:     0x5DADE2,   // Azul claro — informação
  MUTED:    0x36393F,   // Cinza escuro — desativado
  TICKET:   0x5865F2,   // Blurple — tickets
  MOD:      0xEB459E,   // Rosa — ações de moderação
  SETUP:    0x2ECC71,   // Verde esmeralda — painel de config
  DARK:     0x2B2D31,   // Quase preto — backgrounds
  GOLD:     0xF1C40F,   // Ouro — ranking/level
};

const BANNER_URL = process.env.BANNER_URL || null;
const LOGO_URL   = process.env.LOGO_URL   || null;

// ─── Separador visual ─────────────────────────────────────────────────────────
const SEP = '─────────────────────────────────';

/**
 * Cria um embed padrão com o tema Gari Bot
 */
const createEmbed = (options = {}) => {
  const embed = new EmbedBuilder()
    .setColor(options.color ?? COLORS.PRIMARY)
    .setTimestamp();

  if (options.title)       embed.setTitle(options.title);
  if (options.description) embed.setDescription(options.description);
  if (options.fields)      embed.addFields(options.fields);
  if (options.thumbnail)   embed.setThumbnail(options.thumbnail);
  if (options.image)       embed.setImage(options.image);
  if (options.url)         embed.setURL(options.url);
  if (options.author)      embed.setAuthor(options.author);

  embed.setFooter(
    options.footer ?? {
      text: 'Gari Bot  •  Moderação & Gerenciamento',
      iconURL: LOGO_URL ?? undefined,
    }
  );

  return embed;
};

/** Embed de sucesso */
const successEmbed = (title, description) =>
  createEmbed({ color: COLORS.SUCCESS, title: `✅  ${title}`, description });

/** Embed de erro */
const errorEmbed = (title, description) =>
  createEmbed({ color: COLORS.ERROR, title: `✖  ${title}`, description });

/** Embed de aviso */
const warningEmbed = (title, description) =>
  createEmbed({ color: COLORS.WARNING, title: `⚠  ${title}`, description });

/** Embed de informação */
const infoEmbed = (title, description) =>
  createEmbed({ color: COLORS.INFO, title: `ℹ  ${title}`, description });

/**
 * Embed de moderação formatado
 */
const modEmbed = (action, target, moderator, reason, extra = {}) => {
  const meta = {
    ban:    { icon: '🔨', label: 'Banimento',      color: COLORS.ERROR },
    kick:   { icon: '👢', label: 'Expulsão',       color: COLORS.WARNING },
    mute:   { icon: '🔇', label: 'Silenciamento',  color: COLORS.MOD },
    unmute: { icon: '🔊', label: 'Dessilenciado',  color: COLORS.SUCCESS },
    warn:   { icon: '⚠', label: 'Aviso',           color: COLORS.WARNING },
    unban:  { icon: '✅', label: 'Desbanimento',   color: COLORS.SUCCESS },
  };

  const { icon, label, color } = meta[action] ?? { icon: '🛡️', label: action.toUpperCase(), color: COLORS.MOD };

  return createEmbed({
    color,
    author: {
      name: `${icon}  Moderação — ${label}`,
      iconURL: LOGO_URL ?? undefined,
    },
    fields: [
      { name: '👤  Usuário',     value: `${target.tag ?? target}\n\`${target.id ?? 'N/A'}\``,     inline: true },
      { name: '🛡️  Moderador',   value: `${moderator.tag ?? moderator}`,                           inline: true },
      { name: '\u200B',          value: '\u200B',                                                   inline: true },
      { name: '📋  Motivo',      value: reason || 'Sem motivo informado',                          inline: false },
      ...Object.entries(extra).map(([name, value]) => ({ name, value: String(value), inline: true })),
    ],
  });
};

module.exports = {
  COLORS,
  SEP,
  BANNER_URL,
  LOGO_URL,
  createEmbed,
  successEmbed,
  errorEmbed,
  warningEmbed,
  infoEmbed,
  modEmbed,
};
