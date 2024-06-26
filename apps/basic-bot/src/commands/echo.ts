import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { SlashCommand } from '../types/slashCommand';

export const echo: SlashCommand = {
  name: '메아리',
  description: '말을 그대로 따라합니다.',
  options: [
    {
      required: true,
      name: '뭐라고',
      description: '따라하게 시킬 내용을 적습니다',
      type: ApplicationCommandOptionTypes.STRING,
    },
  ],
  execute: async (_, interaction) => {
    const echoMessage = interaction.options.get('뭐라고')?.value || '';
    await interaction.followUp({
      ephemeral: true,
      content: `${interaction.user.username.toString()} 가라사대: ${echoMessage}`,
    });
  },
};
