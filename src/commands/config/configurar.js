/**
 * ============================================
 *   GARI BOT - Comando: /configurar
 *   ⚠️  APENAS O DONO DO BOT PODE USAR ⚠️
 *   ID do Dono: 1435424556662915082
 * ============================================
 */

const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, createEmbed, COLORS } = require('../../utils/embeds');
const { getGuildConfig, isOwner } = require('../../utils/helpers');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('configurar')
    .setDescription('⚙️ [DONO] Configura o Gari Bot no servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ─── Subcomando: canais ───────────────────────────────────────────
    .addSubcommandGroup(group =>
      group.setName('canais').setDescription('Configurar canais do bot')
        .addSubcommand(sub =>
          sub.setName('logs')
            .setDescription('Define o canal de logs')
            .addChannelOption(o => o.setName('canal').setDescription('Canal de logs').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand(sub =>
          sub.setName('boasvindas')
            .setDescription('Define o canal de boas-vindas')
            .addChannelOption(o => o.setName('canal').setDescription('Canal de boas-vindas').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand(sub =>
          sub.setName('saida')
            .setDescription('Define o canal de saída de membros')
            .addChannelOption(o => o.setName('canal').setDescription('Canal de saída').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
        .addSubcommand(sub =>
          sub.setName('tickets')
            .setDescription('Define a categoria e canal de logs de tickets')
            .addChannelOption(o => o.setName('categoria').setDescription('Categoria dos tickets').addChannelTypes(ChannelType.GuildCategory).setRequired(true))
            .addChannelOption(o => o.setName('logs').setDescription('Canal de logs de tickets').addChannelTypes(ChannelType.GuildText).setRequired(false))
        )
        .addSubcommand(sub =>
          sub.setName('levelup')
            .setDescription('Define o canal de notificação de level up')
            .addChannelOption(o => o.setName('canal').setDescription('Canal de level up').addChannelTypes(ChannelType.GuildText).setRequired(true))
        )
    )

    // ─── Subcomando: sistemas ─────────────────────────────────────────
    .addSubcommandGroup(group =>
      group.setName('sistemas').setDescription('Ativar/desativar sistemas')
        .addSubcommand(sub =>
          sub.setName('toggle')
            .setDescription('Ativar ou desativar um sistema')
            .addStringOption(o =>
              o.setName('sistema').setDescription('Sistema a configurar').setRequired(true)
                .addChoices(
                  { name: '👋 Boas-vindas', value: 'welcome' },
                  { name: '🚪 Saída de membros', value: 'leave' },
                  { name: '🎭 Auto-Role', value: 'autoRole' },
                  { name: '⭐ Sistema de Níveis', value: 'levels' },
                  { name: '🚫 Anti-Spam', value: 'antiSpam' },
                  { name: '🔗 Anti-Link', value: 'antiLink' },
                  { name: '💧 Anti-Flood', value: 'antiFlood' },
                  { name: '📋 Logs', value: 'logs' },
                  { name: '🤖 Respostas Automáticas', value: 'autoResponses' },
                  { name: '🎟️ Tickets', value: 'tickets' },
                )
            )
            .addBooleanOption(o => o.setName('ativo').setDescription('Ativar ou desativar').setRequired(true))
        )
    )

    // ─── Subcomando: cargos ───────────────────────────────────────────
    .addSubcommandGroup(group =>
      group.setName('cargos').setDescription('Configurar cargos do bot')
        .addSubcommand(sub =>
          sub.setName('autorole')
            .setDescription('Cargo dado automaticamente ao entrar')
            .addRoleOption(o => o.setName('cargo').setDescription('Cargo auto-role').setRequired(true))
        )
        .addSubcommand(sub =>
          sub.setName('staff')
            .setDescription('Cargo de staff (acesso aos tickets)')
            .addRoleOption(o => o.setName('cargo').setDescription('Cargo de staff').setRequired(true))
        )
    )

    // ─── Subcomando: mensagens ────────────────────────────────────────
    .addSubcommandGroup(group =>
      group.setName('mensagens').setDescription('Personalizar mensagens do bot')
        .addSubcommand(sub =>
          sub.setName('boasvindas')
            .setDescription('Mensagem de boas-vindas')
            .addStringOption(o =>
              o.setName('mensagem')
                .setDescription('Use: {user} {username} {count} {server}')
                .setRequired(true)
                .setMaxLength(1000)
            )
        )
        .addSubcommand(sub =>
          sub.setName('saida')
            .setDescription('Mensagem de saída')
            .addStringOption(o =>
              o.setName('mensagem')
                .setDescription('Use: {user} {username} {count} {server}')
                .setRequired(true)
                .setMaxLength(1000)
            )
        )
    )

    // ─── Subcomando: autoresposta ─────────────────────────────────────
    .addSubcommandGroup(group =>
      group.setName('autoresposta').setDescription('Gerenciar respostas automáticas')
        .addSubcommand(sub =>
          sub.setName('adicionar')
            .setDescription('Adiciona uma resposta automática')
            .addStringOption(o => o.setName('gatilho').setDescription('Palavra/frase que aciona').setRequired(true))
            .addStringOption(o => o.setName('resposta').setDescription('Resposta do bot').setRequired(true))
            .addBooleanOption(o => o.setName('exato').setDescription('Requer correspondência exata?').setRequired(false))
        )
        .addSubcommand(sub =>
          sub.setName('remover')
            .setDescription('Remove uma resposta automática')
            .addStringOption(o => o.setName('gatilho').setDescription('Gatilho a remover').setRequired(true))
        )
        .addSubcommand(sub =>
          sub.setName('listar').setDescription('Lista todas as respostas automáticas')
        )
    ),

  // ─── Execução ────────────────────────────────────────────────────────
  async execute(interaction) {
    // ⛔ VERIFICAÇÃO DO DONO DO BOT
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        embeds: [createEmbed({
          color: COLORS.ERROR,
          title: '⛔ Acesso Negado',
          description: '**Apenas o dono do bot pode usar este comando.**\n\nEste comando é restrito e não pode ser utilizado por outros usuários.',
          footer: { text: '🤖 Gari Bot • Sistema de Segurança' },
        })],
        ephemeral: true,
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const group = interaction.options.getSubcommandGroup();
    const sub = interaction.options.getSubcommand();
    const config = await getGuildConfig(interaction.guild.id);

    try {
      // ── CANAIS ────────────────────────────────────────────────────────
      if (group === 'canais') {
        if (sub === 'logs') {
          const canal = interaction.options.getChannel('canal');
          config.channels.logs = canal.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Canal de Logs', `Canal de logs definido para ${canal}!`)] });
        }

        if (sub === 'boasvindas') {
          const canal = interaction.options.getChannel('canal');
          config.channels.welcomeChannel = canal.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Canal de Boas-vindas', `Canal de boas-vindas definido para ${canal}!`)] });
        }

        if (sub === 'saida') {
          const canal = interaction.options.getChannel('canal');
          config.channels.leaveChannel = canal.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Canal de Saída', `Canal de saída definido para ${canal}!`)] });
        }

        if (sub === 'tickets') {
          const categoria = interaction.options.getChannel('categoria');
          const logs = interaction.options.getChannel('logs');
          config.channels.ticketCategory = categoria.id;
          if (logs) config.channels.ticketLogs = logs.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Tickets Configurados', `Categoria de tickets: ${categoria.name}${logs ? `\nLogs: ${logs}` : ''}`)] });
        }

        if (sub === 'levelup') {
          const canal = interaction.options.getChannel('canal');
          config.channels.levelUp = canal.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Canal de Level Up', `Canal de level up definido para ${canal}!`)] });
        }
      }

      // ── SISTEMAS ──────────────────────────────────────────────────────
      if (group === 'sistemas' && sub === 'toggle') {
        const sistema = interaction.options.getString('sistema');
        const ativo = interaction.options.getBoolean('ativo');
        config.systems[sistema] = ativo;
        await config.save();

        const status = ativo ? '🟢 **Ativado**' : '🔴 **Desativado**';
        return interaction.editReply({
          embeds: [successEmbed('Sistema Atualizado', `O sistema **${sistema}** foi ${status}!`)],
        });
      }

      // ── CARGOS ────────────────────────────────────────────────────────
      if (group === 'cargos') {
        if (sub === 'autorole') {
          const cargo = interaction.options.getRole('cargo');
          config.roles.autoRole = cargo.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Auto-Role', `Cargo auto-role definido para ${cargo}!`)] });
        }

        if (sub === 'staff') {
          const cargo = interaction.options.getRole('cargo');
          config.roles.staffRole = cargo.id;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Cargo Staff', `Cargo de staff definido para ${cargo}!`)] });
        }
      }

      // ── MENSAGENS ─────────────────────────────────────────────────────
      if (group === 'mensagens') {
        const mensagem = interaction.options.getString('mensagem');

        if (sub === 'boasvindas') {
          config.messages.welcome = mensagem;
          await config.save();
          return interaction.editReply({
            embeds: [successEmbed('Mensagem de Boas-vindas', `Mensagem atualizada!\n\n**Preview:**\n> ${mensagem.replace(/{user}/g, interaction.user.toString()).replace(/{username}/g, interaction.user.username).replace(/{count}/g, interaction.guild.memberCount).replace(/{server}/g, interaction.guild.name)}`)],
          });
        }

        if (sub === 'saida') {
          config.messages.leave = mensagem;
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Mensagem de Saída', `Mensagem de saída atualizada!\n\n> ${mensagem}`)] });
        }
      }

      // ── AUTO-RESPOSTAS ────────────────────────────────────────────────
      if (group === 'autoresposta') {
        if (sub === 'adicionar') {
          const gatilho = interaction.options.getString('gatilho').toLowerCase();
          const resposta = interaction.options.getString('resposta');
          const exato = interaction.options.getBoolean('exato') || false;

          // Verifica se já existe
          const existente = config.autoResponses.find(r => r.trigger === gatilho);
          if (existente) {
            existente.response = resposta;
            existente.exactMatch = exato;
          } else {
            config.autoResponses.push({ trigger: gatilho, response: resposta, exactMatch: exato });
          }

          await config.save();
          return interaction.editReply({
            embeds: [successEmbed('Auto-Resposta Adicionada', `**Gatilho:** \`${gatilho}\`\n**Resposta:** ${resposta}\n**Exato:** ${exato ? 'Sim' : 'Não'}`)],
          });
        }

        if (sub === 'remover') {
          const gatilho = interaction.options.getString('gatilho').toLowerCase();
          const index = config.autoResponses.findIndex(r => r.trigger === gatilho);
          if (index === -1) {
            return interaction.editReply({ embeds: [errorEmbed('Não encontrado', `Nenhuma auto-resposta com o gatilho \`${gatilho}\`.`)] });
          }
          config.autoResponses.splice(index, 1);
          await config.save();
          return interaction.editReply({ embeds: [successEmbed('Removida', `Auto-resposta \`${gatilho}\` removida!`)] });
        }

        if (sub === 'listar') {
          if (config.autoResponses.length === 0) {
            return interaction.editReply({ embeds: [createEmbed({ color: COLORS.INFO, title: '🤖 Auto-Respostas', description: 'Nenhuma auto-resposta configurada.' })] });
          }
          const list = config.autoResponses.map((r, i) => `**${i + 1}.** \`${r.trigger}\` → ${r.response.substring(0, 50)}...`).join('\n');
          return interaction.editReply({ embeds: [createEmbed({ color: COLORS.PRIMARY, title: '🤖 Auto-Respostas', description: list })] });
        }
      }

    } catch (error) {
      console.error('[CONFIGURAR]', error);
      await interaction.editReply({ embeds: [errorEmbed('Erro', 'Ocorreu um erro ao salvar as configurações.')] });
    }
  },
};
