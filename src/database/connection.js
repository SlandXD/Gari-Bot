/**
 * ============================================
 *   GARI BOT - Conexão com o MongoDB
 * ============================================
 */

const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/garibot';

    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`[DATABASE] ✅ Conectado ao MongoDB com sucesso!`);

    // Eventos de conexão
    mongoose.connection.on('error', (err) => {
      console.error('[DATABASE] ❌ Erro de conexão:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE] ⚠️  Desconectado do MongoDB. Tentando reconectar...');
    });

  } catch (error) {
    console.error('[DATABASE] ❌ Falha ao conectar:', error.message);
    console.log('[DATABASE] ⚠️  Continuando sem banco de dados (modo limitado)...');
  }
};

module.exports = connectDatabase;
