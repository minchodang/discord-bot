import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types/slashCommand';

export const echo: SlashCommand = {
  data: new SlashCommandBuilder()
    .addStringOption((option) =>
      option
        .setName('뭐라고')
        .setDescription('따라하게 시킬 내용을 적습니다')
        .setRequired(true)
    )
    .setName('메아리')
    .setDescription('말을 그대로 따라합니다.') as SlashCommandBuilder,
  execute: async (_, interaction) => {
    const echoMessage = interaction.options.get('뭐라고')?.value || '';
    await interaction.followUp({
      ephemeral: true,
      content: `${interaction.user.username.toString()} 가라사대: ${echoMessage}`,
    });
  },
};
