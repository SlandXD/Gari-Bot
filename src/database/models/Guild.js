/**
 * ============================================
 *   GARI BOT - Model: Configurações do Servidor
 * ============================================
 */

const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  // ID do servidor
  guildId: {
    type: String,
    required: true,
    unique: true,
  },

  // ─── Canais Configurados ─────────────────────────────────────────────────
  channels: {
    logs: { type: String, default: null },          // Canal de logs gerais
    welcomeChannel: { type: String, default: null }, // Canal de boas-vindas
    leaveChannel: { type: String, default: null },   // Canal de saída
    ticketCategory: { type: String, default: null }, // Categoria de tickets
    ticketLogs: { type: String, default: null },     // Canal de logs de tickets
    levelUp: { type: String, default: null },        // Canal de level up
  },

  // ─── Cargos Configurados ─────────────────────────────────────────────────
  roles: {
    muteRole: { type: String, default: null },       // Cargo de mute
    autoRole: { type: String, default: null },       // Cargo automático ao entrar
    staffRole: { type: String, default: null },      // Cargo de staff (acesso tickets)
  },

  // ─── Sistemas Ativados/Desativados ───────────────────────────────────────
  systems: {
    welcome: { type: Boolean, default: false },
    leave: { type: Boolean, default: false },
    autoRole: { type: Boolean, default: false },
    levels: { type: Boolean, default: true },
    antiSpam: { type: Boolean, default: false },
    antiLink: { type: Boolean, default: false },
    antiFlood: { type: Boolean, default: false },
    logs: { type: Boolean, default: false },
    autoResponses: { type: Boolean, default: false },
    tickets: { type: Boolean, default: false },
  },

  // ─── Mensagens Personalizadas ────────────────────────────────────────────
  messages: {
    welcome: {
      type: String,
      default: '👋 Bem-vindo(a) ao servidor, {user}! Você é o membro #{count}.',
    },
    leave: {
      type: String,
      default: '😢 {user} saiu do servidor. Até logo!',
    },
  },

  // ─── Respostas Automáticas ───────────────────────────────────────────────
  autoResponses: [
    {
      trigger: String,   // Palavra/frase que aciona
      response: String,  // Resposta do bot
      exactMatch: { type: Boolean, default: false },
    },
  ],

  // ─── Configurações Anti-Spam/Flood ───────────────────────────────────────
  antiSpamConfig: {
    maxMessages: { type: Number, default: 5 },   // Máx. msgs em X segundos
    timeWindow: { type: Number, default: 5000 },  // Janela de tempo (ms)
    punishment: { type: String, default: 'mute' }, // warn / mute / kick / ban
  },

  antiFloodConfig: {
    maxMessages: { type: Number, default: 8 },
    timeWindow: { type: Number, default: 10000 },
    punishment: { type: String, default: 'mute' },
  },

  // Contagem de tickets criados no servidor
  ticketCounter: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('Guild', guildSchema);
