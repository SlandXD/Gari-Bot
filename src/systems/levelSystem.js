/**
 * ============================================
 *   GARI BOT - Sistema: Níveis e XP
 * ============================================
 */

const { createEmbed, COLORS } = require('../utils/embeds');
const { getUserData, progressBar } = require('../utils/helpers');

// XP por mensagem: valor aleatório entre MIN e MAX
const XP_MIN = 15;
const XP_MAX = 25;
// Cooldown: usuário só ganha XP a cada X ms
const XP_COOLDOWN = 60_000; // 1 minuto

/**
 * Processa uma mensagem e concede XP ao usuário
 */
const processMessage = async (message, config, client) => {
  try {
    const userData = await getUserData(message.author.id, message.guild.id);

    // Verifica cooldown
    const now = Date.now();
    if (userData.lastXpGain && (now - userData.lastXpGain.getTime()) < XP_COOLDOWN) {
      // Ainda no cooldown, apenas conta a mensagem
      userData.totalMessages += 1;
      await userData.save();
      return;
    }

    // Gera XP aleatório
    const xpGained = Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
    const oldLevel = userData.level;

    // Atualiza os dados
    userData.totalMessages += 1;
    userData.lastXpGain = new Date();
    const leveledUp = userData.addXP(xpGained);

    await userData.save();

    // Notifica o level up
    if (leveledUp && config.channels.levelUp) {
      const levelChannel = message.guild.channels.cache.get(config.channels.levelUp);
      const targetChannel = levelChannel || message.channel;

      const embed = createEmbed({
        color: COLORS.PRIMARY,
        title: '⭐ LEVEL UP!',
        description: [
          `🎉 Parabéns, ${message.author}!`,
          ``,
          `Você subiu de nível: **${oldLevel}** → **${userData.level}**`,
          ``,
          `\`${progressBar(userData.xp, userData.xpForNextLevel(), 15)}\``,
          `XP para próximo nível: \`${userData.xp}/${userData.xpForNextLevel()}\``,
        ].join('\n'),
        thumbnail: message.author.displayAvatarURL(),
      });

      await targetChannel.send({ embeds: [embed] }).catch(() => {});
    }

  } catch (error) {
    console.error('[LEVEL SYSTEM]', error.message);
  }
};

module.exports = { processMessage };
