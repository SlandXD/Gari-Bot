/**
 * ============================================
 *   GARI BOT - Evento: ready
 *   Disparado quando o bot fica online
 * ============================================
 */

const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true, // Executa apenas uma vez

  execute(client) {
    console.log('');
    console.log(`[BOT] ✅ ${client.user.tag} está online!`);
    console.log(`[BOT] 🌐 Conectado em ${client.guilds.cache.size} servidor(es)`);
    console.log(`[BOT] 👥 Servindo ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} membros`);
    console.log('');

    // Define as atividades do bot em rotação
    const activities = [
      { name: '🧹 Limpando o chat...', type: ActivityType.Playing },
      { name: `${client.guilds.cache.size} servidores`, type: ActivityType.Watching },
      { name: '/help para ver os comandos', type: ActivityType.Listening },
      { name: '⚡ Mantendo a ordem!', type: ActivityType.Playing },
    ];

    let index = 0;

    // Define a atividade inicial
    client.user.setActivity(activities[0].name, { type: activities[0].type });

    // Alterna as atividades a cada 30 segundos
    setInterval(() => {
      index = (index + 1) % activities.length;
      client.user.setActivity(activities[index].name, { type: activities[index].type });
    }, 30_000);
  },
};
