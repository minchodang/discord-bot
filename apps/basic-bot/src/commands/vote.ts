import {
  Client,
  SlashCommandBuilder,
  CommandInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';
import { addPoll } from '../store/pollStore';

export interface Vote {
  option: string;
  userId: string;
}

interface Poll {
  pollId: string;
  question: string;
  options: string[];
  votes: Vote[];
  isActive: boolean;
}

export const createPoll: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('투표생성')
    .setDescription('새로운 투표를 생성합니다.')
    .addStringOption((option) =>
      option.setName('질문').setDescription('투표 질문').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('옵션')
        .setDescription('투표 옵션 (쉼표로 구분)')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    const question = interaction.options.getString('질문', true);
    const optionsString = interaction.options.getString('옵션', true);
    const options = optionsString.split(',').map((option) => option.trim());

    const pollId = `${Date.now()}-${interaction.user.id}`;

    const newPoll: Poll = {
      pollId,
      question,
      options,
      votes: [],
      isActive: true,
    };

    addPoll(newPoll);

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      options.map((option, index) =>
        new ButtonBuilder()
          .setCustomId(`${pollId}-${index}`)
          .setLabel(`${option} (0)`)
          .setStyle(ButtonStyle.Primary)
      )
    );

    const endPollButton = new ButtonBuilder()
      .setCustomId(`${pollId}-end`)
      .setLabel('투표 종료')
      .setStyle(ButtonStyle.Danger);

    buttons.addComponents(endPollButton);

    await interaction.reply({
      content: `**${question}**\n옵션을 클릭하여 투표하세요.`,
      components: [buttons],
    });
  },
};
