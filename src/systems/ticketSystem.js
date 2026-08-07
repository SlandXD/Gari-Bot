/**
 * ============================================
 *   GARI BOT - Sistema: Tickets Completo
 *   - Abrir ticket
 *   - Fechar ticket com transcript
 *   - Assumir ticket (staff)
 *   - Logs de tickets
 * ============================================
 */

const {
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} = require('discord.js');
const { createEmbed, COLORS, BANNER_URL, LOGO_URL } = require('../utils/embeds');
const { getGuildConfig } = require('../utils/helpers');
const Guild = require('../database/models/Guild');
const Ticket = require('../database/models/Ticket');

/**
 * Abre um novo ticket para o usuário
 */
const openTicket = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });

  const config = await getGuildConfig(interaction.guild.id);

  // Verifica se o sistema está ativo
  if (!config.systems.tickets) {
    return interaction.editReply({ content: '❌ O sistema de tickets está desativado.' });
  }

  // Verifica se o usuário já tem um ticket aberto
  const existingTicket = await Ticket.findOne({
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    status: 'open',
  });

  if (existingTicket) {
    const existingChannel = interaction.guild.channels.cache.get(existingTicket.channelId);
    if (existingChannel) {
      return interaction.editReply({
        content: `❌ Você já possui um ticket aberto! Acesse: ${existingChannel}`,
      });
    }
    // Canal não existe mais, fecha o ticket no banco
    existingTicket.status = 'closed';
    await existingTicket.save();
  }

  // Incrementa o contador de tickets do servidor
  config.ticketCounter += 1;
  await config.save();

  const ticketNumber = String(config.ticketCounter).padStart(4, '0');
  const ticketId = `ticket-${ticketNumber}`;

  try {
    // Cria o canal do ticket
    const categoryId = config.channels.ticketCategory;
    const staffRoleId = config.roles.staffRole;

    // Permissões base
    const permissionOverwrites = [
      {
        // Nega acesso para @everyone
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        // Permite acesso para o usuário
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
        ],
      },
      {
        // Permite acesso para o bot
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ];

    // Adiciona permissões para o cargo de staff
    if (staffRoleId) {
      permissionOverwrites.push({
        id: staffRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      });
    }

    const ticketChannel = await interaction.guild.channels.create({
      name: ticketId,
      type: ChannelType.GuildText,
      parent: categoryId || undefined,
      permissionOverwrites,
      topic: `Ticket de ${interaction.user.tag} | ID: ${interaction.user.id}`,
    });

    // Salva o ticket no banco de dados
    const ticket = await Ticket.create({
      ticketId,
      guildId: interaction.guild.id,
      channelId: ticketChannel.id,
      userId: interaction.user.id,
      status: 'open',
    });

    // Embed de abertura do ticket com banner
    const openEmbed = createEmbed({
      color: COLORS.PRIMARY,
      title: `🎟️ Ticket #${ticketNumber}`,
      description: [
        `> Olá, ${interaction.user}! 👋`,
        `> Seu ticket foi aberto com sucesso.`,
        ``,
        `**Descreva seu problema detalhadamente** e nossa equipe irá atendê-lo em breve.`,
        ``,
        '```ansi',
        '\u001b[1;32m📋 INFORMAÇÕES\u001b[0m',
        `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
        `🆔 Ticket: #${ticketNumber}`,
        `👤 Usuário: ${interaction.user.tag}`,
        `📅 Aberto: ${new Date().toLocaleString('pt-BR')}`,
        '```',
      ].join('\n'),
      image: BANNER_URL,
      thumbnail: interaction.user.displayAvatarURL({ size: 256 }),
      footer: { text: '🤖 Gari Bot • Sistema de Suporte' },
    });

    // Botões de controle do ticket
    const controlRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('ticket_close')
        .setLabel('🔒 Fechar Ticket')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('ticket_claim')
        .setLabel('✋ Assumir Ticket')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('ticket_transcript')
        .setLabel('📄 Salvar Transcript')
        .setStyle(ButtonStyle.Secondary),
    );

    // Menção ao staff se configurado
    const staffMention = staffRoleId ? `<@&${staffRoleId}>` : '';

    await ticketChannel.send({
      content: staffMention || undefined,
      embeds: [openEmbed],
      components: [controlRow],
    });

    await interaction.editReply({
      content: `✅ Seu ticket foi aberto! Acesse: ${ticketChannel}`,
    });

    // Log de abertura
    await sendTicketLog(interaction.client, interaction.guild, config, 'open', ticket, interaction.user);

  } catch (error) {
    console.error('[TICKET OPEN]', error);
    await interaction.editReply({ content: '❌ Ocorreu um erro ao criar o ticket.' });
  }
};

/**
 * Fecha um ticket
 */
const closeTicket = async (interaction) => {
  const ticket = await Ticket.findOne({
    guildId: interaction.guild.id,
    channelId: interaction.channel.id,
    status: 'open',
  });

  if (!ticket) {
    return interaction.reply({ content: '❌ Este canal não é um ticket ativo.', ephemeral: true });
  }

  await interaction.deferReply();

  try {
    // Coleta o transcript das mensagens
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const transcriptContent = messages.reverse().map(m => {
      const time = new Date(m.createdTimestamp).toLocaleString('pt-BR');
      return `[${time}] ${m.author.tag}: ${m.content || '[Embed/Arquivo]'}`;
    }).join('\n');

    // Gera o arquivo de transcript
    const transcriptBuffer = Buffer.from(transcriptContent, 'utf-8');
    const attachment = new AttachmentBuilder(transcriptBuffer, {
      name: `transcript-${ticket.ticketId}.txt`,
    });

    // Atualiza o ticket no banco
    ticket.status = 'closed';
    ticket.closedAt = new Date();
    ticket.closedBy = interaction.user.id;
    await ticket.save();

    // Envia confirmação com transcript
    await interaction.editReply({
      embeds: [createEmbed({
        color: COLORS.ERROR,
        title: '🔒 Ticket Fechado',
        description: `O ticket foi fechado por ${interaction.user}.\nO canal será deletado em **5 segundos**.`,
      })],
      files: [attachment],
    });

    // Envia log com transcript
    const config = await getGuildConfig(interaction.guild.id);
    await sendTicketLog(interaction.client, interaction.guild, config, 'close', ticket, interaction.user, attachment);

    // Deleta o canal após 5 segundos
    setTimeout(async () => {
      await interaction.channel.delete(`Ticket fechado por ${interaction.user.tag}`).catch(() => {});
    }, 5000);

  } catch (error) {
    console.error('[TICKET CLOSE]', error);
    await interaction.editReply({ content: '❌ Erro ao fechar o ticket.' });
  }
};

/**
 * Staff assume o ticket
 */
const claimTicket = async (interaction) => {
  const config = await getGuildConfig(interaction.guild.id);

  // Verifica se é staff
  const isStaff = config.roles.staffRole
    ? interaction.member.roles.cache.has(config.roles.staffRole)
    : interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

  if (!isStaff) {
    return interaction.reply({
      content: '❌ Apenas membros da equipe podem assumir tickets.',
      ephemeral: true,
    });
  }

  const ticket = await Ticket.findOne({
    guildId: interaction.guild.id,
    channelId: interaction.channel.id,
    status: 'open',
  });

  if (!ticket) {
    return interaction.reply({ content: '❌ Ticket não encontrado.', ephemeral: true });
  }

  if (ticket.assignedTo) {
    const assigned = await interaction.guild.members.fetch(ticket.assignedTo).catch(() => null);
    return interaction.reply({
      content: `❌ Este ticket já foi assumido por ${assigned ? assigned.user.tag : 'um membro da equipe'}.`,
      ephemeral: true,
    });
  }

  ticket.assignedTo = interaction.user.id;
  await ticket.save();

  await interaction.reply({
    embeds: [createEmbed({
      color: COLORS.SUCCESS,
      title: '✋ Ticket Assumido',
      description: `${interaction.user} assumiu este ticket e irá atendê-lo em breve!`,
    })],
  });

  // Atualiza o nome do canal para indicar o responsável
  await interaction.channel.setName(`${ticket.ticketId}-${interaction.user.username}`).catch(() => {});
};

/**
 * Salva o transcript manualmente
 */
const saveTranscript = async (interaction) => {
  const config = await getGuildConfig(interaction.guild.id);
  const isStaff = config.roles.staffRole
    ? interaction.member.roles.cache.has(config.roles.staffRole)
    : interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

  if (!isStaff) {
    return interaction.reply({ content: '❌ Apenas a equipe pode salvar o transcript.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  const messages = await interaction.channel.messages.fetch({ limit: 100 });
  const content = messages.reverse().map(m => {
    const time = new Date(m.createdTimestamp).toLocaleString('pt-BR');
    return `[${time}] ${m.author.tag}: ${m.content || '[Embed/Arquivo]'}`;
  }).join('\n');

  const buffer = Buffer.from(content, 'utf-8');
  const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

  await interaction.editReply({
    content: '📄 Transcript salvo!',
    files: [attachment],
  });
};

/**
 * Envia log de ticket no canal configurado
 */
const sendTicketLog = async (client, guild, config, action, ticket, user, transcript = null) => {
  if (!config.channels.ticketLogs) return;
  const logChannel = guild.channels.cache.get(config.channels.ticketLogs);
  if (!logChannel) return;

  const embed = createEmbed({
    color: action === 'open' ? COLORS.SUCCESS : COLORS.ERROR,
    title: action === 'open' ? '🎟️ Ticket Aberto' : '🔒 Ticket Fechado',
    fields: [
      { name: '🆔 Ticket', value: ticket.ticketId, inline: true },
      { name: '👤 Usuário', value: `<@${ticket.userId}>`, inline: true },
      { name: action === 'open' ? '📅 Aberto em' : '📅 Fechado em', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true },
      ...(action === 'close' && ticket.assignedTo
        ? [{ name: '✋ Atendido por', value: `<@${ticket.assignedTo}>`, inline: true }]
        : []),
    ],
  });

  await logChannel.send({
    embeds: [embed],
    files: transcript ? [transcript] : [],
  }).catch(() => {});
};

module.exports = { openTicket, closeTicket, claimTicket, saveTranscript };
