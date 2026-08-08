/**
 * ============================================
 *   GARI BOT - Comando: /meme
 *   Busca memes do Reddit
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, errorEmbed, COLORS } = require('../../utils/embeds');
const axios = require('axios');

// Subreddits de memes (em português/internacionais)
const SUBREDDITS = [
  'dankmemes',
  'memes',
  'HUEstation',
  'brasil',
  'eu_nvr',
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('😂 Busca um meme aleatório'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const subreddit = SUBREDDITS[Math.floor(Math.random() * SUBREDDITS.length)];
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/random.json?limit=1`, {
        headers: { 'User-Agent': 'GariBot/1.0' },
        timeout: 5000,
      });

      const post = response.data[0]?.data?.children[0]?.data;

      if (!post || post.over_18 || !post.url.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
        return interaction.editReply({
          embeds: [errorEmbed('Meme não encontrado', 'Não foi possível carregar um meme agora. Tente novamente!')],
        });
      }

      const embed = createEmbed({
        color: COLORS.PRIMARY,
        title: post.title.length > 256 ? post.title.substring(0, 253) + '...' : post.title,
        image: post.url,
        footer: {
          text: `👍 ${post.ups} • 💬 ${post.num_comments} comentários • r/${subreddit}`,
        },
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('[MEME]', error.message);
      await interaction.editReply({
        embeds: [errorEmbed('Erro', 'Não foi possível buscar um meme. O Reddit pode estar indisponível.')],
      });
    }
  },
};
