/**
 * ============================================
 *   GARI BOT - Comandos de Diversão
 *   /coinflip, /dado, /piada, /fato
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');

// Banco de piadas
const PIADAS = [
  { setup: 'Por que o programador foi ao médico?', punchline: 'Porque estava com muitos *bugs*! 🐛' },
  { setup: 'O que o zero disse pro oito?', punchline: 'Bonito cinto! 😄' },
  { setup: 'Por que o livro de matemática ficou triste?', punchline: 'Porque tinha muitos problemas!' },
  { setup: 'O que a impressora disse pra outra?', punchline: 'Essa folha é minha! 📄' },
  { setup: 'Por que o computador foi ao médico?', punchline: 'Estava com vírus! 💻' },
  { setup: 'Como chama um peixe sem olho?', punchline: 'Pxe! 🐟' },
  { setup: 'O que o termômetro disse pro outro?', punchline: 'Você tem mais grau que eu!' },
  { setup: 'Por que o banco foi preso?', punchline: 'Porque lavou dinheiro! 💸' },
];

// Fatos curiosos
const FATOS = [
  '🌍 A Terra tem mais de 4 bilhões de anos de existência.',
  '🐙 Os polvos têm três corações e sangue azul.',
  '🍯 O mel nunca estraga. Mel de 3000 anos ainda é comestível!',
  '🦈 Os tubarões existem há mais tempo que as árvores.',
  '🐌 Um caracol pode dormir por até 3 anos.',
  '🌙 A Lua se afasta da Terra cerca de 3,8 cm por ano.',
  '🧠 O cérebro humano tem cerca de 86 bilhões de neurônios.',
  '🐋 O coração de uma baleia azul pesa tanto quanto um carro.',
  '🦋 As borboletas provam com os pés.',
  '🌊 O oceano é mais desconhecido que a superfície de Marte.',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('diversao')
    .setDescription('🎮 Comandos de diversão')
    .addSubcommand(sub =>
      sub.setName('coinflip').setDescription('🪙 Cara ou coroa?')
    )
    .addSubcommand(sub =>
      sub.setName('dado')
        .setDescription('🎲 Rola um dado')
        .addIntegerOption(o => o.setName('lados').setDescription('Número de lados (padrão: 6)').setMinValue(2).setMaxValue(100))
    )
    .addSubcommand(sub =>
      sub.setName('piada').setDescription('😂 Conta uma piada aleatória')
    )
    .addSubcommand(sub =>
      sub.setName('fato').setDescription('🤓 Fato curioso aleatório')
    )
    .addSubcommand(sub =>
      sub.setName('8ball')
        .setDescription('🎱 Pergunta para a bola mágica')
        .addStringOption(o => o.setName('pergunta').setDescription('Sua pergunta').setRequired(true))
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'coinflip') {
      const result = Math.random() < 0.5;
      const embed = createEmbed({
        color: result ? COLORS.SUCCESS : COLORS.WARNING,
        title: '🪙 Cara ou Coroa?',
        description: `A moeda caiu em... **${result ? '🟡 Cara' : '⚪ Coroa'}**!`,
      });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'dado') {
      const sides = interaction.options.getInteger('lados') || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      const embed = createEmbed({
        color: COLORS.PRIMARY,
        title: '🎲 Dado Rolado!',
        description: `Você rolou um **d${sides}** e tirou: **${result}**!`,
        footer: { text: `1 a ${sides}` },
      });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'piada') {
      const piada = PIADAS[Math.floor(Math.random() * PIADAS.length)];
      const embed = createEmbed({
        color: COLORS.PRIMARY,
        title: '😂 Piada do Gari',
        fields: [
          { name: '❓ Pergunta', value: piada.setup, inline: false },
          { name: '💡 Resposta', value: `||${piada.punchline}||`, inline: false },
        ],
        footer: { text: 'Clique na resposta para revelar!' },
      });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'fato') {
      const fato = FATOS[Math.floor(Math.random() * FATOS.length)];
      const embed = createEmbed({
        color: COLORS.INFO,
        title: '🤓 Fato Curioso!',
        description: fato,
      });
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === '8ball') {
      const pergunta = interaction.options.getString('pergunta');
      const respostas = [
        { text: '✅ Sim, com certeza!', color: COLORS.SUCCESS },
        { text: '✅ Definitivamente sim!', color: COLORS.SUCCESS },
        { text: '✅ Tudo aponta que sim.', color: COLORS.SUCCESS },
        { text: '✅ Provavelmente sim.', color: COLORS.SUCCESS },
        { text: '🤔 Não tenho certeza...', color: COLORS.WARNING },
        { text: '🤔 Talvez. Pergunte novamente.', color: COLORS.WARNING },
        { text: '❌ Não parece bom.', color: COLORS.ERROR },
        { text: '❌ Definitivamente não.', color: COLORS.ERROR },
        { text: '❌ As perspectivas não são boas.', color: COLORS.ERROR },
        { text: '❌ Minha resposta é não.', color: COLORS.ERROR },
      ];
      const resp = respostas[Math.floor(Math.random() * respostas.length)];
      const embed = createEmbed({
        color: resp.color,
        title: '🎱 Bola Mágica',
        fields: [
          { name: '❓ Pergunta', value: pergunta, inline: false },
          { name: '🎱 Resposta', value: `**${resp.text}**`, inline: false },
        ],
      });
      return interaction.reply({ embeds: [embed] });
    }
  },
};
