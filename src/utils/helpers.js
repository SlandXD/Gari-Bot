/**
 * ============================================
 *   GARI BOT - Funções Auxiliares Gerais
 * ============================================
 */

const Guild = require('../database/models/Guild');
const User = require('../database/models/User');

/**
 * Busca ou cria as configurações de um servidor no banco de dados
 * @param {string} guildId - ID do servidor
 * @returns {Promise<Guild>}
 */
const getGuildConfig = async (guildId) => {
  let config = await Guild.findOne({ guildId });
  if (!config) {
    config = await Guild.create({ guildId });
  }
  return config;
};

/**
 * Busca ou cria os dados de um usuário no banco de dados
 * @param {string} userId - ID do usuário
 * @param {string} guildId - ID do servidor
 * @returns {Promise<User>}
 */
const getUserData = async (userId, guildId) => {
  let user = await User.findOne({ userId, guildId });
  if (!user) {
    user = await User.create({ userId, guildId });
  }
  return user;
};

/**
 * Formata tempo em milissegundos para texto legível
 * @param {number} ms - Tempo em milissegundos
 * @returns {string}
 */
const formatDuration = (ms) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Envia um log em um canal configurado
 * @param {Client} client - Cliente Discord
 * @param {Guild} guild - Objeto do servidor
 * @param {EmbedBuilder} embed - Embed a ser enviado
 */
const sendLog = async (client, guild, embed) => {
  try {
    const config = await getGuildConfig(guild.id);
    if (!config.systems.logs || !config.channels.logs) return;

    const logChannel = guild.channels.cache.get(config.channels.logs);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[LOG] Erro ao enviar log:', error.message);
  }
};

/**
 * Verifica se o usuário é o dono do bot
 * @param {string} userId - ID do usuário
 * @returns {boolean}
 */
const isOwner = (userId) => {
  return userId === process.env.OWNER_ID;
};

/**
 * Substitui variáveis em mensagens customizadas
 * {user} = menção, {username} = nome, {count} = membros, {server} = servidor
 */
const formatMessage = (template, member) => {
  return template
    .replace(/{user}/g, member.toString())
    .replace(/{username}/g, member.user.username)
    .replace(/{count}/g, member.guild.memberCount)
    .replace(/{server}/g, member.guild.name)
    .replace(/{id}/g, member.id);
};

/**
 * Gera uma barra de progresso visual
 * @param {number} current - Valor atual
 * @param {number} max - Valor máximo
 * @param {number} length - Comprimento da barra
 * @returns {string}
 */
const progressBar = (current, max, length = 10) => {
  const filled = Math.round((current / max) * length);
  const empty = length - filled;
  return '▓'.repeat(filled) + '░'.repeat(empty);
};

module.exports = {
  getGuildConfig,
  getUserData,
  formatDuration,
  sendLog,
  isOwner,
  formatMessage,
  progressBar,
};
