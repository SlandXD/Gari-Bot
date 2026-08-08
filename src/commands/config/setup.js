/**
 * ============================================
 *   GARI BOT — /setup
 *   Painel de configuração interativo
 *   Qualquer administrador do servidor pode usar
 * ============================================
 */

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  ChannelSelectMenuBuilder,
  RoleSelectMenuBuilder,
} = require('discord.js');

const { createEmbed, successEmbed, errorEmbed, COLORS, LOGO_URL } = require('../../utils/embeds');
const { getGuildConfig } = require('../../utils/helpers');

// ─── Helpers visuais ─────────────────────────────────────────────────────────

const bool = (v) => v ? '`🟢 Ativo `' : '`🔴 Inativo`';
const ch   = (id) => id ? `<#${id}>` : '`Não configurado`';
const ro   = (id) => id ? `<@&${id}>` : '`Não configurado`';


// ─── Embed principal do painel ────────────────────────────────────────────────

const buildMainEmbed = (guild, config) => {
  const s = config.systems;
  const c = config.channels;
  const r = config.roles;

  return createEmbed({
    color: COLORS.SETUP,
    author: {
      name: `⚙️  Painel de Configuração  —  ${guild.name}`,
      iconURL: guild.iconURL({ dynamic: true }) ?? undefined,
    },
    description: [
      '> Bem-vindo ao painel de gerenciamento do **Gari Bot**.',
      '> Use o menu abaixo para navegar pelas seções.',
      '',
      '```ansi',
      '\u001b[1;32m  📊 VISÃO GERAL\u001b[0m',
      '```',
    ].join('\n'),
    fields: [
      {
        name: '📢  Canais',
        value: [
          `📋 Logs: ${ch(c.logs)}`,
          `👋 Boas-vindas: ${ch(c.welcomeChannel)}`,
          `🚪 Saída: ${ch(c.leaveChannel)}`,
          `🎟️ Tickets: ${ch(c.ticketCategory)}`,
          `⭐ Level Up: ${ch(c.levelUp)}`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🎭  Cargos',
        value: [
          `🤖 Auto-Role: ${ro(r.autoRole)}`,
          `👮 Staff: ${ro(r.staffRole)}`,
        ].join('\n'),
        inline: true,
      },
      { name: '\u200B', value: '\u200B', inline: false },
      {
        name: '⚙️  Sistemas',
        value: [
          `${bool(s.welcome)} Boas-vindas`,
          `${bool(s.leave)} Saída`,
          `${bool(s.autoRole)} Auto-Role`,
          `${bool(s.levels)} Níveis/XP`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🛡️  Proteção',
        value: [
          `${bool(s.antiSpam)} Anti-Spam`,
          `${bool(s.antiLink)} Anti-Link`,
          `${bool(s.antiFlood)} Anti-Flood`,
          `${bool(s.logs)} Logs`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🧩  Extras',
        value: [
          `${bool(s.tickets)} Tickets`,
          `${bool(s.autoResponses)} Auto-Resposta`,
        ].join('\n'),
        inline: true,
      },
    ],
    footer: { text: 'Gari Bot  •  Selecione uma categoria no menu abaixo', iconURL: LOGO_URL ?? undefined },
  });
};


// ─── Menu principal de navegação ──────────────────────────────────────────────

const buildMainMenu = () =>
  new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('setup_nav')
      .setPlaceholder('📂  Selecione uma categoria…')
      .addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel('📢  Canais')
          .setDescription('Configure os canais do bot')
          .setValue('canais')
          .setEmoji('📢'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🎭  Cargos')
          .setDescription('Auto-role e cargo de staff')
          .setValue('cargos')
          .setEmoji('🎭'),
        new StringSelectMenuOptionBuilder()
          .setLabel('⚙️  Sistemas')
          .setDescription('Ativar ou desativar módulos')
          .setValue('sistemas')
          .setEmoji('⚙️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('✉️  Mensagens')
          .setDescription('Personalizar boas-vindas e saída')
          .setValue('mensagens')
          .setEmoji('✉️'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🤖  Auto-Respostas')
          .setDescription('Gerenciar respostas automáticas')
          .setValue('autoresposta')
          .setEmoji('🤖'),
        new StringSelectMenuOptionBuilder()
          .setLabel('🛡️  Proteção (Anti-Spam)')
          .setDescription('Configurar limites de spam/flood')
          .setValue('protecao')
          .setEmoji('🛡️'),
      )
  );

// ─── Botão de voltar ──────────────────────────────────────────────────────────

const backRow = () =>
  new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('setup_back')
      .setLabel('← Voltar ao Painel')
      .setStyle(ButtonStyle.Secondary)
  );


// ─── Seção: CANAIS ────────────────────────────────────────────────────────────

const buildCanaisEmbed = (config) =>
  createEmbed({
    color: COLORS.INFO,
    title: '📢  Configuração de Canais',
    description: 'Selecione qual canal deseja configurar clicando nos botões abaixo.',
    fields: [
      { name: '📋  Logs',         value: ch(config.channels.logs),            inline: true },
      { name: '👋  Boas-vindas',  value: ch(config.channels.welcomeChannel),  inline: true },
      { name: '🚪  Saída',        value: ch(config.channels.leaveChannel),     inline: true },
      { name: '🎟️  Cat. Tickets', value: ch(config.channels.ticketCategory),  inline: true },
      { name: '📄  Logs Tickets', value: ch(config.channels.ticketLogs),       inline: true },
      { name: '⭐  Level Up',     value: ch(config.channels.levelUp),          inline: true },
    ],
  });

const buildCanaisRows = () => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup_canal_logs').setLabel('📋 Canal de Logs').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_canal_welcome').setLabel('👋 Boas-vindas').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_canal_leave').setLabel('🚪 Saída').setStyle(ButtonStyle.Primary),
  ),
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup_canal_tickets').setLabel('🎟️ Cat. Tickets').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_canal_ticketlogs').setLabel('📄 Logs Tickets').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_canal_levelup').setLabel('⭐ Level Up').setStyle(ButtonStyle.Primary),
  ),
  backRow(),
];


// ─── Seção: CARGOS ────────────────────────────────────────────────────────────

const buildCargosEmbed = (config) =>
  createEmbed({
    color: COLORS.PRIMARY,
    title: '🎭  Configuração de Cargos',
    description: 'Selecione um cargo nos menus abaixo.',
    fields: [
      { name: '🤖  Auto-Role', value: ro(config.roles.autoRole), inline: true },
      { name: '👮  Staff',     value: ro(config.roles.staffRole), inline: true },
    ],
  });

const buildCargosRows = () => [
  new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId('setup_role_autorole')
      .setPlaceholder('🤖  Auto-Role — cargo dado ao entrar')
  ),
  new ActionRowBuilder().addComponents(
    new RoleSelectMenuBuilder()
      .setCustomId('setup_role_staff')
      .setPlaceholder('👮  Staff — acesso aos tickets')
  ),
  backRow(),
];


// ─── Seção: SISTEMAS ──────────────────────────────────────────────────────────

const buildSistemasEmbed = (config) => {
  const s = config.systems;
  return createEmbed({
    color: COLORS.SETUP,
    title: '⚙️  Ativar / Desativar Sistemas',
    description: 'Clique em um botão para alternar o estado de cada módulo.',
    fields: [
      {
        name: '🌐  Módulos Gerais',
        value: [
          `${bool(s.welcome)} **Boas-vindas**`,
          `${bool(s.leave)} **Saída de Membros**`,
          `${bool(s.autoRole)} **Auto-Role**`,
          `${bool(s.levels)} **Níveis / XP**`,
          `${bool(s.logs)} **Logs de Ações**`,
        ].join('\n'),
        inline: true,
      },
      {
        name: '🛡️  Proteção',
        value: [
          `${bool(s.antiSpam)} **Anti-Spam**`,
          `${bool(s.antiLink)} **Anti-Link**`,
          `${bool(s.antiFlood)} **Anti-Flood**`,
          `${bool(s.tickets)} **Tickets**`,
          `${bool(s.autoResponses)} **Auto-Resposta**`,
        ].join('\n'),
        inline: true,
      },
    ],
  });
};

const buildSistemasRows = (systems) => {
  const btn = (id, label, system) =>
    new ButtonBuilder()
      .setCustomId(`setup_toggle_${id}`)
      .setLabel(label)
      .setStyle(systems[system] ? ButtonStyle.Success : ButtonStyle.Secondary);

  return [
    new ActionRowBuilder().addComponents(
      btn('welcome',  '👋 Boas-vindas',  'welcome'),
      btn('leave',    '🚪 Saída',        'leave'),
      btn('autorole', '🤖 Auto-Role',    'autoRole'),
      btn('levels',   '⭐ Níveis',       'levels'),
      btn('logs',     '📋 Logs',         'logs'),
    ),
    new ActionRowBuilder().addComponents(
      btn('antispam',  '🚫 Anti-Spam',  'antiSpam'),
      btn('antilink',  '🔗 Anti-Link',  'antiLink'),
      btn('antiflood', '💧 Anti-Flood', 'antiFlood'),
      btn('tickets',   '🎟️ Tickets',   'tickets'),
      btn('autoresponses', '🤖 Auto-Resp', 'autoResponses'),
    ),
    backRow(),
  ];
};


// ─── Seção: MENSAGENS ─────────────────────────────────────────────────────────

const buildMensagensEmbed = (config) =>
  createEmbed({
    color: COLORS.INFO,
    title: '✉️  Mensagens Personalizadas',
    description: 'Clique nos botões para editar as mensagens.\n\nVariáveis disponíveis: `{user}` `{username}` `{count}` `{server}`',
    fields: [
      { name: '👋  Boas-vindas', value: `\`\`\`${config.messages.welcome}\`\`\``, inline: false },
      { name: '🚪  Saída',       value: `\`\`\`${config.messages.leave}\`\`\``,   inline: false },
    ],
  });

const buildMensagensRows = () => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup_msg_welcome').setLabel('✏️ Editar Boas-vindas').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_msg_leave').setLabel('✏️ Editar Saída').setStyle(ButtonStyle.Primary),
  ),
  backRow(),
];

// ─── Seção: AUTO-RESPOSTAS ────────────────────────────────────────────────────

const buildAutoRespostasEmbed = (config) => {
  const list = config.autoResponses.length === 0
    ? '*Nenhuma auto-resposta configurada.*'
    : config.autoResponses.map((r, i) =>
        `**${i + 1}.** \`${r.trigger}\` → ${r.response.substring(0, 60)}${r.response.length > 60 ? '…' : ''}`
      ).join('\n');

  return createEmbed({
    color: COLORS.PRIMARY,
    title: '🤖  Auto-Respostas',
    description: list,
  });
};

const buildAutoRespostasRows = () => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup_ar_add').setLabel('➕ Adicionar').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('setup_ar_remove').setLabel('➖ Remover').setStyle(ButtonStyle.Danger),
  ),
  backRow(),
];


// ─── Seção: PROTEÇÃO (Anti-Spam config) ──────────────────────────────────────

const buildProtecaoEmbed = (config) =>
  createEmbed({
    color: COLORS.WARNING,
    title: '🛡️  Proteção — Anti-Spam & Flood',
    description: 'Ajuste os limites de detecção de spam e flood.',
    fields: [
      {
        name: '🚫  Anti-Spam',
        value: [
          `Máx. mensagens: \`${config.antiSpamConfig.maxMessages}\``,
          `Janela de tempo: \`${config.antiSpamConfig.timeWindow / 1000}s\``,
          `Punição: \`${config.antiSpamConfig.punishment}\``,
        ].join('\n'),
        inline: true,
      },
      {
        name: '💧  Anti-Flood',
        value: [
          `Máx. mensagens: \`${config.antiFloodConfig.maxMessages}\``,
          `Janela de tempo: \`${config.antiFloodConfig.timeWindow / 1000}s\``,
          `Punição: \`${config.antiFloodConfig.punishment}\``,
        ].join('\n'),
        inline: true,
      },
    ],
  });

const buildProtecaoRows = () => [
  new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('setup_prot_spam').setLabel('⚙️ Config Anti-Spam').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('setup_prot_flood').setLabel('⚙️ Config Anti-Flood').setStyle(ButtonStyle.Primary),
  ),
  backRow(),
];


// ─── Modals ───────────────────────────────────────────────────────────────────

const modalMsgWelcome = (current) => {
  const modal = new ModalBuilder().setCustomId('modal_msg_welcome').setTitle('✏️ Mensagem de Boas-vindas');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('msg_value')
        .setLabel('Mensagem  —  use {user} {username} {count} {server}')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(current)
        .setMaxLength(1000)
        .setRequired(true)
    )
  );
  return modal;
};

const modalMsgLeave = (current) => {
  const modal = new ModalBuilder().setCustomId('modal_msg_leave').setTitle('✏️ Mensagem de Saída');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('msg_value')
        .setLabel('Mensagem  —  use {user} {username} {count} {server}')
        .setStyle(TextInputStyle.Paragraph)
        .setValue(current)
        .setMaxLength(1000)
        .setRequired(true)
    )
  );
  return modal;
};

const modalArAdd = () => {
  const modal = new ModalBuilder().setCustomId('modal_ar_add').setTitle('➕ Nova Auto-Resposta');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('ar_trigger')
        .setLabel('Gatilho (palavra ou frase)')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('ar_response')
        .setLabel('Resposta do bot')
        .setStyle(TextInputStyle.Paragraph)
        .setMaxLength(500)
        .setRequired(true)
    )
  );
  return modal;
};

const modalArRemove = () => {
  const modal = new ModalBuilder().setCustomId('modal_ar_remove').setTitle('➖ Remover Auto-Resposta');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('ar_trigger')
        .setLabel('Gatilho a remover')
        .setStyle(TextInputStyle.Short)
        .setMaxLength(100)
        .setRequired(true)
    )
  );
  return modal;
};

const modalSpam = (config) => {
  const modal = new ModalBuilder().setCustomId('modal_prot_spam').setTitle('⚙️ Config Anti-Spam');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('max_msgs').setLabel('Máx. mensagens (ex: 5)').setStyle(TextInputStyle.Short).setValue(String(config.antiSpamConfig.maxMessages)).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('time_window').setLabel('Janela de tempo em segundos (ex: 5)').setStyle(TextInputStyle.Short).setValue(String(config.antiSpamConfig.timeWindow / 1000)).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('punishment').setLabel('Punição: warn / mute / kick / ban').setStyle(TextInputStyle.Short).setValue(config.antiSpamConfig.punishment).setRequired(true)
    )
  );
  return modal;
};

const modalFlood = (config) => {
  const modal = new ModalBuilder().setCustomId('modal_prot_flood').setTitle('⚙️ Config Anti-Flood');
  modal.addComponents(
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('max_msgs').setLabel('Máx. mensagens (ex: 8)').setStyle(TextInputStyle.Short).setValue(String(config.antiFloodConfig.maxMessages)).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('time_window').setLabel('Janela de tempo em segundos (ex: 10)').setStyle(TextInputStyle.Short).setValue(String(config.antiFloodConfig.timeWindow / 1000)).setRequired(true)
    ),
    new ActionRowBuilder().addComponents(
      new TextInputBuilder().setCustomId('punishment').setLabel('Punição: warn / mute / kick / ban').setStyle(TextInputStyle.Short).setValue(config.antiFloodConfig.punishment).setRequired(true)
    )
  );
  return modal;
};


// ─── Select menu para escolher canal ─────────────────────────────────────────

const buildChannelSelectRow = (customId, placeholder, types = [ChannelType.GuildText]) =>
  new ActionRowBuilder().addComponents(
    new ChannelSelectMenuBuilder()
      .setCustomId(customId)
      .setPlaceholder(placeholder)
      .addChannelTypes(...types)
  );

// ─── Mapa de toggle de sistemas ───────────────────────────────────────────────

const TOGGLE_MAP = {
  welcome:       'welcome',
  leave:         'leave',
  autorole:      'autoRole',
  levels:        'levels',
  logs:          'logs',
  antispam:      'antiSpam',
  antilink:      'antiLink',
  antiflood:     'antiFlood',
  tickets:       'tickets',
  autoresponses: 'autoResponses',
};


// ─── Definição do Slash Command ───────────────────────────────────────────────

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('⚙️  Painel de configuração do Gari Bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // ─── execute: abre o painel ────────────────────────────────────────────────
  async execute(interaction) {
    const config = await getGuildConfig(interaction.guild.id);
    await interaction.reply({
      embeds: [buildMainEmbed(interaction.guild, config)],
      components: [buildMainMenu()],
      ephemeral: true,
    });
  },

  // ─── handleInteraction: todas as interações do painel ─────────────────────
  async handleInteraction(interaction) {
    // Apenas admins podem interagir com o painel
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Apenas administradores podem usar o painel.', ephemeral: true });
    }

    const config = await getGuildConfig(interaction.guild.id);
    const id = interaction.customId;

    // ── VOLTAR AO PAINEL PRINCIPAL ────────────────────────────────────────────
    if (id === 'setup_back') {
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.update({
        embeds: [buildMainEmbed(interaction.guild, fresh)],
        components: [buildMainMenu()],
      });
    }

    // ── NAVEGAÇÃO PRINCIPAL ───────────────────────────────────────────────────
    if (id === 'setup_nav') {
      const section = interaction.values[0];
      if (section === 'canais') {
        return interaction.update({ embeds: [buildCanaisEmbed(config)], components: buildCanaisRows() });
      }
      if (section === 'cargos') {
        return interaction.update({ embeds: [buildCargosEmbed(config)], components: buildCargosRows() });
      }
      if (section === 'sistemas') {
        return interaction.update({ embeds: [buildSistemasEmbed(config)], components: buildSistemasRows(config.systems) });
      }
      if (section === 'mensagens') {
        return interaction.update({ embeds: [buildMensagensEmbed(config)], components: buildMensagensRows() });
      }
      if (section === 'autoresposta') {
        return interaction.update({ embeds: [buildAutoRespostasEmbed(config)], components: buildAutoRespostasRows() });
      }
      if (section === 'protecao') {
        return interaction.update({ embeds: [buildProtecaoEmbed(config)], components: buildProtecaoRows() });
      }
    }

    // ── CANAIS — abrir select menu de canal ───────────────────────────────────
    const canalMap = {
      setup_canal_logs:       { placeholder: '📋  Escolha o canal de logs',            key: 'logs',           types: [ChannelType.GuildText] },
      setup_canal_welcome:    { placeholder: '👋  Escolha o canal de boas-vindas',      key: 'welcomeChannel', types: [ChannelType.GuildText] },
      setup_canal_leave:      { placeholder: '🚪  Escolha o canal de saída',            key: 'leaveChannel',   types: [ChannelType.GuildText] },
      setup_canal_tickets:    { placeholder: '🎟️  Escolha a categoria de tickets',      key: 'ticketCategory', types: [ChannelType.GuildCategory] },
      setup_canal_ticketlogs: { placeholder: '📄  Escolha o canal de logs de tickets', key: 'ticketLogs',     types: [ChannelType.GuildText] },
      setup_canal_levelup:    { placeholder: '⭐  Escolha o canal de level up',         key: 'levelUp',        types: [ChannelType.GuildText] },
    };

    if (canalMap[id]) {
      const { placeholder, key, types } = canalMap[id];
      return interaction.update({
        embeds: [createEmbed({ color: COLORS.INFO, title: '📢  Selecione o Canal', description: placeholder })],
        components: [
          buildChannelSelectRow(`setup_set_canal_${key}`, placeholder, types),
          backRow(),
        ],
      });
    }

    // ── CANAIS — receber canal selecionado ────────────────────────────────────
    if (id.startsWith('setup_set_canal_')) {
      const key = id.replace('setup_set_canal_', '');
      const channel = interaction.values[0];
      config.channels[key] = channel;
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.update({
        embeds: [buildCanaisEmbed(fresh)],
        components: buildCanaisRows(),
      });
    }

    // ── CARGOS — receber cargo selecionado ────────────────────────────────────
    if (id === 'setup_role_autorole') {
      config.roles.autoRole = interaction.values[0];
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.update({ embeds: [buildCargosEmbed(fresh)], components: buildCargosRows() });
    }
    if (id === 'setup_role_staff') {
      config.roles.staffRole = interaction.values[0];
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.update({ embeds: [buildCargosEmbed(fresh)], components: buildCargosRows() });
    }

    // ── SISTEMAS — toggle ─────────────────────────────────────────────────────
    if (id.startsWith('setup_toggle_')) {
      const key = id.replace('setup_toggle_', '');
      const sysKey = TOGGLE_MAP[key];
      if (sysKey) {
        config.systems[sysKey] = !config.systems[sysKey];
        await config.save();
        const fresh = await getGuildConfig(interaction.guild.id);
        return interaction.update({ embeds: [buildSistemasEmbed(fresh)], components: buildSistemasRows(fresh.systems) });
      }
    }

    // ── MENSAGENS — abrir modal ───────────────────────────────────────────────
    if (id === 'setup_msg_welcome') return interaction.showModal(modalMsgWelcome(config.messages.welcome));
    if (id === 'setup_msg_leave')   return interaction.showModal(modalMsgLeave(config.messages.leave));

    // ── AUTO-RESPOSTAS — abrir modal ──────────────────────────────────────────
    if (id === 'setup_ar_add')    return interaction.showModal(modalArAdd());
    if (id === 'setup_ar_remove') return interaction.showModal(modalArRemove());

    // ── PROTEÇÃO — abrir modal ────────────────────────────────────────────────
    if (id === 'setup_prot_spam')  return interaction.showModal(modalSpam(config));
    if (id === 'setup_prot_flood') return interaction.showModal(modalFlood(config));
  },

  // ─── handleModal: processa envio de modals ─────────────────────────────────
  async handleModal(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ Apenas administradores podem usar o painel.', ephemeral: true });
    }

    await interaction.deferUpdate();
    const config = await getGuildConfig(interaction.guild.id);
    const id = interaction.customId;

    if (id === 'modal_msg_welcome') {
      config.messages.welcome = interaction.fields.getTextInputValue('msg_value');
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildMensagensEmbed(fresh)], components: buildMensagensRows() });
    }

    if (id === 'modal_msg_leave') {
      config.messages.leave = interaction.fields.getTextInputValue('msg_value');
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildMensagensEmbed(fresh)], components: buildMensagensRows() });
    }

    if (id === 'modal_ar_add') {
      const trigger  = interaction.fields.getTextInputValue('ar_trigger').toLowerCase().trim();
      const response = interaction.fields.getTextInputValue('ar_response');
      const existing = config.autoResponses.find(r => r.trigger === trigger);
      if (existing) {
        existing.response = response;
      } else {
        config.autoResponses.push({ trigger, response, exactMatch: false });
      }
      await config.save();
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildAutoRespostasEmbed(fresh)], components: buildAutoRespostasRows() });
    }

    if (id === 'modal_ar_remove') {
      const trigger = interaction.fields.getTextInputValue('ar_trigger').toLowerCase().trim();
      const idx = config.autoResponses.findIndex(r => r.trigger === trigger);
      if (idx !== -1) {
        config.autoResponses.splice(idx, 1);
        await config.save();
      }
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildAutoRespostasEmbed(fresh)], components: buildAutoRespostasRows() });
    }

    if (id === 'modal_prot_spam') {
      const maxMsgs    = parseInt(interaction.fields.getTextInputValue('max_msgs'), 10);
      const timeWindow = parseFloat(interaction.fields.getTextInputValue('time_window')) * 1000;
      const punishment = interaction.fields.getTextInputValue('punishment').toLowerCase().trim();
      if (!isNaN(maxMsgs) && !isNaN(timeWindow) && ['warn','mute','kick','ban'].includes(punishment)) {
        config.antiSpamConfig.maxMessages = maxMsgs;
        config.antiSpamConfig.timeWindow  = timeWindow;
        config.antiSpamConfig.punishment  = punishment;
        await config.save();
      }
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildProtecaoEmbed(fresh)], components: buildProtecaoRows() });
    }

    if (id === 'modal_prot_flood') {
      const maxMsgs    = parseInt(interaction.fields.getTextInputValue('max_msgs'), 10);
      const timeWindow = parseFloat(interaction.fields.getTextInputValue('time_window')) * 1000;
      const punishment = interaction.fields.getTextInputValue('punishment').toLowerCase().trim();
      if (!isNaN(maxMsgs) && !isNaN(timeWindow) && ['warn','mute','kick','ban'].includes(punishment)) {
        config.antiFloodConfig.maxMessages = maxMsgs;
        config.antiFloodConfig.timeWindow  = timeWindow;
        config.antiFloodConfig.punishment  = punishment;
        await config.save();
      }
      const fresh = await getGuildConfig(interaction.guild.id);
      return interaction.editReply({ embeds: [buildProtecaoEmbed(fresh)], components: buildProtecaoRows() });
    }
  },
};
