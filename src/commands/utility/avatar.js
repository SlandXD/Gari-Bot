/**
 * ============================================
 *   GARI BOT - Comando: /avatar
 * ============================================
 */

const { SlashCommandBuilder } = require('discord.js');
const { createEmbed, COLORS } = require('../../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ Mostra o avatar de um usuário')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuário para ver o avatar (deixe vazio para ver o seu)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser('usuario') || interaction.user;

    // Obtém as URLs do avatar em diferentes tamanhos
    const avatarURL = target.displayAvatarURL({ size: 4096, extension: 'png', forceStatic: false });
    const staticURL = target.displayAvatarURL({ size: 4096, extension: 'png', forceStatic: true });

    const embed = createEmbed({
      color: COLORS.PRIMARY,
      title: `🖼️ Avatar de ${target.username}`,
      description: [
        `**Formatos disponíveis:**`,
        `[PNG](${target.displayAvatarURL({ extension: 'png', size: 4096 })}) • `,
        `[JPG](${target.displayAvatarURL({ extension: 'jpg', size: 4096 })}) • `,
        `[WebP](${target.displayAvatarURL({ extension: 'webp', size: 4096 })})`,
        target.avatar?.startsWith('a_') ? ` • [GIF](${target.displayAvatarURL({ extension: 'gif', size: 4096 })})` : '',
      ].join(''),
      image: avatarURL,
    });

    await interaction.reply({ embeds: [embed] });
  },
};
