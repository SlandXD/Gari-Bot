/**
 * ============================================
 *   GARI BOT - Comando: /help
 *   Mostra todos os comandos com embed estilizado
 * ============================================
 */

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { createEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖 Mostra todos os comandos do Gari Bot'),

  async execute(interaction) {
    // Embed principal com banner
    const mainEmbed = createEmbed({
      color: COLORS.PRIMARY,
      title: '🤖 Gari Bot — Central de Ajuda',
      description: [
        '> Olá! Sou o **Gari Bot**, o robô que limpa o chat e mantém a ordem! 🧹',
        '',
        '> Selecione uma categoria abaixo para ver os comandos disponíveis.',
        '',
        '```ansi',
        '\u001b[1;32m⚙  SISTEMAS DISPONÍVEIS\u001b[0m',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
        '🛡️  Moderação    |  Kick, Ban, Mute...',
        '🎟️  Tickets      |  Suporte ao usuário',
        '⚡  Automação    |  Boas-vindas, Níveis',
        '🎮  Diversão     |  Memes, jogos',
        '🔧  Utilidade    |  Info, avatar, ping',
        '```',
      ].join('\n'),
      image: BANNER_URL,
      thumbnail: LOGO_URL,
      footer: { text: '🤖 Gari Bot v1.0.0 • Use /configurar para configurar o bot' },
    });

    // Menu de seleção de categorias
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📂 Selecione uma categoria...')
      .addOptions([
        {
          label: '🛡️ Moderação',
          description: 'Comandos de ban, kick, mute, warn e logs',
          value: 'moderation',
          emoji: '🛡️',
        },
        {
          label: '🎟️ Tickets',
          description: 'Sistema de suporte por tickets',
          value: 'tickets',
          emoji: '🎟️',
        },
        {
          label: '⚡ Automação',
          description: 'Boas-vindas, auto-role, níveis e XP',
          value: 'automation',
          emoji: '⚡',
        },
        {
          label: '🎮 Diversão',
          description: 'Memes e comandos divertidos',
          value: 'fun',
          emoji: '🎮',
        },
        {
          label: '🔧 Utilidade',
          description: 'Ping, avatar, serverinfo, userinfo',
          value: 'utility',
          emoji: '🔧',
        },
        {
          label: '⚙️ Configuração',
          description: 'Configurações do servidor (apenas dono)',
          value: 'config',
          emoji: '⚙️',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const reply = await interaction.reply({
      embeds: [mainEmbed],
      components: [row],
      fetchReply: true,
    });

    // Coletor para o menu de seleção
    const collector = reply.createMessageComponentCollector({
      time: 120_000, // 2 minutos
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: '❌ Apenas quem usou o comando pode interagir com ele!',
          ephemeral: true,
        });
      }

      const category = i.values[0];
      const categoryEmbeds = {
        moderation: createEmbed({
          color: COLORS.ERROR,
          title: '🛡️ Comandos de Moderação',
          description: 'Mantenha seu servidor organizado e seguro!',
          fields: [
            { name: '`/ban`', value: 'Banir um usuário do servidor', inline: true },
            { name: '`/kick`', value: 'Expulsar um usuário do servidor', inline: true },
            { name: '`/mute`', value: 'Silenciar um usuário por tempo', inline: true },
            { name: '`/unmute`', value: 'Remover silenciamento', inline: true },
            { name: '`/warn`', value: 'Avisar um usuário', inline: true },
            { name: '`/warnings`', value: 'Ver advertências de um usuário', inline: true },
            { name: '`/clearwarns`', value: 'Limpar advertências', inline: true },
            { name: '`/purge`', value: 'Deletar mensagens em massa', inline: true },
          ],
        }),
        tickets: createEmbed({
          color: COLORS.TICKET,
          title: '🎟️ Sistema de Tickets',
          description: 'Sistema completo de suporte ao usuário!',
          fields: [
            { name: '`/ticket painel`', value: 'Envia o painel de abertura de tickets', inline: false },
            { name: '**Botões no ticket:**', value: '`Fechar Ticket` • `Assumir Ticket`', inline: false },
            { name: '**Funcionalidades:**', value: '• Canal privado automático\n• Permissões apenas para staff\n• Transcript ao fechar\n• Logs de tickets', inline: false },
          ],
        }),
        automation: createEmbed({
          color: COLORS.SUCCESS,
          title: '⚡ Sistema de Automação',
          description: 'Automatize seu servidor com o Gari Bot!',
          fields: [
            { name: '`/rank`', value: 'Ver seu rank e XP atual', inline: true },
            { name: '`/leaderboard`', value: 'Top 10 membros com mais XP', inline: true },
            { name: '**Boas-vindas**', value: 'Mensagens automáticas ao entrar/sair', inline: false },
            { name: '**Auto-Role**', value: 'Cargo automático ao entrar no servidor', inline: false },
            { name: '**Sistema de Níveis**', value: 'XP por mensagem + notificação de level up', inline: false },
            { name: '**Respostas Automáticas**', value: 'Configure respostas para palavras-chave', inline: false },
          ],
        }),
        fun: createEmbed({
          color: COLORS.INFO,
          title: '🎮 Comandos de Diversão',
          description: 'Deixe o servidor mais animado!',
          fields: [
            { name: '`/meme`', value: 'Gera um meme aleatório', inline: true },
            { name: '`/coinflip`', value: 'Cara ou coroa', inline: true },
            { name: '`/dado`', value: 'Rola um dado', inline: true },
            { name: '`/piada`', value: 'Conta uma piada aleatória', inline: true },
            { name: '`/fato`', value: 'Fato curioso aleatório', inline: true },
          ],
        }),
        utility: createEmbed({
          color: COLORS.INFO,
          title: '🔧 Comandos de Utilidade',
          description: 'Ferramentas úteis para todos!',
          fields: [
            { name: '`/ping`', value: 'Latência do bot', inline: true },
            { name: '`/avatar`', value: 'Ver avatar de um usuário', inline: true },
            { name: '`/serverinfo`', value: 'Informações do servidor', inline: true },
            { name: '`/userinfo`', value: 'Informações de um usuário', inline: true },
            { name: '`/painel`', value: 'Dashboard interno do bot', inline: true },
            { name: '`/help`', value: 'Este menu de ajuda', inline: true },
          ],
        }),
        config: createEmbed({
          color: COLORS.WARNING,
          title: '⚙️ Configuração do Bot',
          description: '> ⚠️ Apenas o **dono do bot** pode usar o comando `/configurar`.',
          fields: [
            { name: '`/configurar canais`', value: 'Configurar canais de logs, boas-vindas, tickets', inline: false },
            { name: '`/configurar sistemas`', value: 'Ativar/desativar sistemas do bot', inline: false },
            { name: '`/configurar mensagens`', value: 'Personalizar mensagens de boas-vindas/saída', inline: false },
            { name: '`/configurar cargos`', value: 'Configurar cargo de mute, auto-role, staff', inline: false },
            { name: '`/configurar autoresposta`', value: 'Gerenciar respostas automáticas', inline: false },
            { name: '`/configurar punições`', value: 'Configurar anti-spam, anti-flood, anti-link', inline: false },
          ],
        }),
      };

      await i.update({
        embeds: [categoryEmbeds[category]],
        components: [row],
      });
    });

    collector.on('end', async () => {
      // Desativa o menu após o tempo
      const disabledRow = new ActionRowBuilder().addComponents(
        selectMenu.setDisabled(true)
      );
      await interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  },
};
