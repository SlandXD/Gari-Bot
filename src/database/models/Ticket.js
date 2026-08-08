/**
 * ============================================
 *   GARI BOT - Model: Tickets de Suporte
 * ============================================
 */

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  // Identificação do ticket
  ticketId: { type: String, required: true },     // Ex: ticket-0001
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },     // Canal criado para o ticket
  userId: { type: String, required: true },        // Quem abriu o ticket
  assignedTo: { type: String, default: null },     // Staff responsável

  // Status: open / closed
  status: { type: String, default: 'open' },

  // Histórico de mensagens para o transcript
  transcript: [
    {
      authorId: String,
      authorTag: String,
      content: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],

  // Datas importantes
  openedAt: { type: Date, default: Date.now },
  closedAt: { type: Date, default: null },
  closedBy: { type: String, default: null },

}, { timestamps: true });

// Índice para busca rápida por servidor
ticketSchema.index({ guildId: 1, ticketId: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);
