/**
 * ============================================
 *   GARI BOT - Deploy de Slash Commands
 *   Execute: node src/deploy-commands.js
 * ============================================
 */

require('dotenv').config();
const { REST, Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

// Coleta todos os comandos de todas as pastas
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;

  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command?.data) {
      commands.push(command.data.toJSON());
      console.log(`[+] Comando coletado: /${command.data.name}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`\n[DEPLOY] Iniciando deploy de ${commands.length} comandos...`);

    // Deploy global (demora até 1 hora para atualizar)
    // Para testes, use deploy em servidor específico (instantâneo)
    if (process.env.GUILD_ID && process.env.NODE_ENV === 'development') {
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands }
      );
      console.log(`[DEPLOY] ✅ Comandos deployados no servidor de teste! (instantâneo)`);
    } else {
      await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(`[DEPLOY] ✅ Comandos deployados globalmente! (pode demorar até 1 hora)`);
    }
  } catch (error) {
    console.error('[DEPLOY] ❌ Erro ao fazer deploy:', error);
  }
})();
