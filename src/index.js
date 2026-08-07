/**
 * ============================================
 *   GARI BOT - Arquivo principal de entrada
 *   O robô que limpa o chat e mantém a ordem!
 * ============================================
 */

require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');

// Importa a conexão com o banco de dados
const connectDatabase = require('./database/connection');

// ─── Criação do cliente Discord ───────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.GuildMember,
    Partials.User,
  ],
});

// ─── Collections para comandos e cooldowns ────────────────────────────────────
client.commands = new Collection();
client.cooldowns = new Collection();

// ─── Carregador de Comandos ───────────────────────────────────────────────────
const loadCommands = () => {
  const commandsPath = path.join(__dirname, 'commands');
  const commandFolders = fs.readdirSync(commandsPath);

  let loaded = 0;
  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
    for (const file of commandFiles) {
      const command = require(path.join(folderPath, file));
      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        loaded++;
      } else {
        console.warn(`[AVISO] Comando em ${file} está incompleto (sem data ou execute).`);
      }
    }
  }
  console.log(`[COMANDOS] ${loaded} comandos carregados com sucesso.`);
};

// ─── Carregador de Eventos ────────────────────────────────────────────────────
const loadEvents = () => {
  const eventsPath = path.join(__dirname, 'events');
  const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

  let loaded = 0;
  for (const file of eventFiles) {
    const event = require(path.join(eventsPath, file));
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
    loaded++;
  }
  console.log(`[EVENTOS] ${loaded} eventos carregados com sucesso.`);
};

// ─── Inicialização ────────────────────────────────────────────────────────────
const init = async () => {
  console.log('');
  console.log('  ██████╗  █████╗ ██████╗ ██╗    ██████╗  ██████╗ ████████╗');
  console.log('  ██╔════╝ ██╔══██╗██╔══██╗██║    ██╔══██╗██╔═══██╗╚══██╔══╝');
  console.log('  ██║  ███╗███████║██████╔╝██║    ██████╔╝██║   ██║   ██║   ');
  console.log('  ██║   ██║██╔══██║██╔══██╗██║    ██╔══██╗██║   ██║   ██║   ');
  console.log('  ╚██████╔╝██║  ██║██║  ██║██║    ██████╔╝╚██████╔╝   ██║   ');
  console.log('   ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝    ╚═════╝  ╚═════╝    ╚═╝   ');
  console.log('');
  console.log('  🤖 O robô que limpa o chat e mantém a ordem!');
  console.log('  ─────────────────────────────────────────────');
  console.log('');

  // Conecta ao banco de dados
  await connectDatabase();

  // Carrega comandos e eventos
  loadCommands();
  loadEvents();

  // Faz login no Discord
  await client.login(process.env.DISCORD_TOKEN);
};

// Tratamento de erros não capturados
process.on('unhandledRejection', (error) => {
  console.error('[ERRO NÃO TRATADO]', error);
});

process.on('uncaughtException', (error) => {
  console.error('[EXCEÇÃO NÃO CAPTURADA]', error);
});

// ─── Graceful Shutdown (Railway envia SIGTERM antes de parar) ─────────────────
const shutdown = async (signal) => {
  console.log(`\n[BOT] Recebido ${signal}. Encerrando graciosamente...`);
  try {
    client.destroy();
    console.log('[BOT] Conexão com Discord encerrada.');
  } catch (e) {
    console.error('[BOT] Erro ao encerrar:', e.message);
  }
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

init();
