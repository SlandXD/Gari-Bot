/**
 * ============================================
 *   GARI BOT - Model: Dados do Usuário
 * ============================================
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // IDs para identificação única por usuário/servidor
  userId: { type: String, required: true },
  guildId: { type: String, required: true },

  // ─── Sistema de Níveis / XP ──────────────────────────────────────────────
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  lastXpGain: { type: Date, default: null }, // Cooldown anti-farm

  // ─── Sistema de Avisos (Warns) ───────────────────────────────────────────
  warnings: [
    {
      reason: String,
      moderatorId: String,
      date: { type: Date, default: Date.now },
    },
  ],

  // ─── Informações Extras ──────────────────────────────────────────────────
  isMuted: { type: Boolean, default: false },
  mutedUntil: { type: Date, default: null },

}, { timestamps: true });

// Índice composto para buscas rápidas
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

/**
 * Calcula o XP necessário para o próximo nível
 * Fórmula: 100 * (nível + 1) ^ 1.5
 */
userSchema.methods.xpForNextLevel = function () {
  return Math.floor(100 * Math.pow(this.level + 1, 1.5));
};

/**
 * Adiciona XP e verifica se subiu de nível
 * Retorna true se houve level up
 */
userSchema.methods.addXP = function (amount) {
  this.xp += amount;
  const needed = this.xpForNextLevel();
  if (this.xp >= needed) {
    this.xp -= needed;
    this.level += 1;
    return true; // Level up!
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
