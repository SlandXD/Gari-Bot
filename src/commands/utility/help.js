/**
 * ============================================
 *   GARI BOT — /help
 *   Central de ajuda com menu por categoria
 * ============================================
 */

const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { createEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../../utils/embeds');

// ─── Embeds por categoria ─────────────────────────────────────────────────────

const CATEGORIES = {
  moderation: () => createEmbed({
    color: COLORS.MOD,
    title: '🛡️  Moderação',
    description: 'Ferramentas para manter seu servidor seguro e organizado.',
    fields: [
      { name: '`/ban`',      value: 'Banir um usuário do servidor',         inline: true },
      { name: '`/kick`',     value: 'Expulsar um usuário do servidor',      inline: true },
      { name: '`/mute`',     value: 'Silenciar por tempo (timeout nativo)', inline: true },
      { name: '`/unmute`',   value: 'Remover o silenciamento',              inline: true },
      { name: '`/warn`',     value: 'Emitir um aviso ao usuário',           inline: true },
      { name: '`/warnings`', value: 'Listar avisos de um membro',           inline: true },
      { name: '`/purge`',    value: 'Deletar mensagens em massa',           inline: true },
    ],
  }),
  tickets: () => createEmbed({
    color: COLORS.PRIMARY,
    title: '🎟️  Tickets',
    description: 'Sistema de suporte com canais privados, transcript e staff.',
    fields: [
      { name: '`/ticket painel`',     value: 'Envia o painel de abertura no canal atual',   inline: false },
      { name: '🔒 Fechar Ticket',     value: 'Gera transcript e fecha o canal',             inline: true },
      { name: '✋ Assumir Ticket',    value: 'Staff marca o ticket como em atendimento',    inline: true },
      { name: '📄 Salvar Transcript', value: 'Exporta o histórico do ticket em `.txt`',     inline: true },
    ],
  }),
  automation: () => createEmbed({
    color: COLORS.SUCCESS,
    title: '⚡  Automação',
    description: 'Recursos automáticos que rodam em background.',
    fields: [
      { name: '`/rank`',        value: 'Ver seu nível e XP atual',              inline: true },
      { name: '`/leaderboard`', value: 'Top 10 membros com mais XP',            inline: true },
      { name: '👋 Boas-vindas', value: 'Mensagem automática ao entrar',          inline: false },
      { name: '🚪 Saída',       value: 'Mensagem automática ao sair',            inline: false },
      { name: '🤖 Auto-Role',   value: 'Cargo dado automaticamente ao entrar',  inline: false },
      { name: '⭐ Níveis/XP',   value: 'XP por mensagem + level up notificado', inline: false },
      { name: '🤖 Auto-Resp',   value: 'Respostas para palavras-chave',         inline: false },
    ],
  }),
  fun: () => createEmbed({
    color: COLORS.INFO,
    title: '🎮  Diversão',
    description: 'Comandos para animar o servidor!',
    fields: [
      { name: '`/meme`',      value: 'Gera um meme aleatório do Reddit', inline: true },
      { name: '`/coinflip`',  value: 'Cara ou coroa',                    inline: true },
      { name: '`/dado`',      value: 'Rola um dado',                     inline: true },
      { name: '`/piada`',     value: 'Piada aleatória',                  inline: true },
      { name: '`/fato`',      value: 'Fato curioso aleatório',           inline: true },
    ],
  }),
  utility: () => createEmbed({
    color: COLORS.INFO,
    title: '🔧  Utilidade',
    description: 'Ferramentas úteis para todos os membros.',
    fields: [
      { name: '`/ping`',       value: 'Latência do bot',                     inline: true },
      { name: '`/avatar`',     value: 'Ver o avatar de um usuário',          inline: true },
      { name: '`/serverinfo`', value: 'Informações completas do servidor',   inline: true },
      { name: '`/userinfo`',   value: 'Informações de um membro',            inline: true },
      { name: '`/painel`',     value: 'Dashboard de status do bot',          inline: true },
      { name: '`/help`',       value: 'Este menu de ajuda',                  inline: true },
    ],
  }),
  config: () => createEmbed({
    color: COLORS.SETUP,
    title: '⚙️  Configuração',
    description: 'Qualquer **administrador** do servidor pode usar `/setup`.',
    fields: [
      { name: '`/setup`',  value: 'Abre o painel interativo de configuração', inline: false },
      { name: '📢 Canais',           value: 'Logs, boas-vindas, tickets, level up',  inline: true },
      { name: '🎭 Cargos',           value: 'Auto-role, staff',                      inline: true },
      { name: '⚙️ Sistemas',         value: 'Ativar/desativar módulos',              inline: true },
      { name: '✉️ Mensagens',        value: 'Boas-vindas e saída personalizadas',    inline: true },
      { name: '🤖 Auto-Respostas',   value: 'Adicionar e remover gatilhos',          inline: true },
      { name: '🛡️ Proteção',         value: 'Ajustar limites de spam/flood',         inline: true },
    ],
  }),
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖  Central de ajuda do Gari Bot'),

  async execute(interaction) {
    const mainEmbed = createEmbed({
      color: COLORS.PRIMARY,
      author: {
        name: 'Gari Bot  •  Central de Ajuda',
        iconURL: interaction.client.user.displayAvatarURL(),
      },
      description: [
        '> Olá! Sou o **Gari Bot** — moderação, automação e diversão em um só lugar.',
        '',
        '> Selecione uma categoria no menu abaixo para ver os comandos.',
        '',
        '```ansi',
        '\u001b[1;34m  CATEGORIAS DISPONÍVEIS\u001b[0m',
        '\u001b[0;37m  🛡️  Moderação   •  🎟️  Tickets\u001b[0m',
        '\u001b[0;37m  ⚡  Automação   •  🎮  Diversão\u001b[0m',
        '\u001b[0;37m  🔧  Utilidade   •  ⚙️  Config\u001b[0m',
        '```',
      ].join('\n'),
      image: BANNER_URL ?? undefined,
      footer: { text: 'Gari Bot  •  /setup para configurar', iconURL: LOGO_URL ?? undefined },
    });

    const menu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📂  Selecione uma categoria…')
      .addOptions(
        new StringSelectMenuOptionBuilder().setLabel('🛡️  Moderação').setDescription('Ban, Kick, Mute, Warn, Purge').setValue('moderation').setEmoji('🛡️'),
        new StringSelectMenuOptionBuilder().setLabel('🎟️  Tickets').setDescription('Suporte com canais privados').setValue('tickets').setEmoji('🎟️'),
        new StringSelectMenuOptionBuilder().setLabel('⚡  Automação').setDescription('Boas-vindas, Níveis, Auto-Role').setValue('automation').setEmoji('⚡'),
        new StringSelectMenuOptionBuilder().setLabel('🎮  Diversão').setDescription('Memes, jogos e piadas').setValue('fun').setEmoji('🎮'),
        new StringSelectMenuOptionBuilder().setLabel('🔧  Utilidade').setDescription('Ping, Avatar, ServerInfo').setValue('utility').setEmoji('🔧'),
        new StringSelectMenuOptionBuilder().setLabel('⚙️  Configuração').setDescription('Painel /setup — admins').setValue('config').setEmoji('⚙️'),
      );

    const row = new ActionRowBuilder().addComponents(menu);

    const reply = await interaction.reply({
      embeds: [mainEmbed],
      components: [row],
      fetchReply: true,
    });

    const collector = reply.createMessageComponentCollector({ time: 120_000 });

    collector.on('collect', async (i) => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Apenas quem usou o comando pode navegar aqui.', ephemeral: true });
      }
      await i.update({ embeds: [CATEGORIES[i.values[0]]()], components: [row] });
    });

    collector.on('end', () => {
      const disabled = new ActionRowBuilder().addComponents(menu.setDisabled(true));
      interaction.editReply({ components: [disabled] }).catch(() => {});
    });
  },
};
