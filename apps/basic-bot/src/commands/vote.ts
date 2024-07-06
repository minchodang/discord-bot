import { SlashCommand } from '../types/slashCommand';
import {
  Client,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from 'discord.js';

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

export const polls: Poll[] = [];

export const createPoll: SlashCommand = {
  name: '투표생성',
  description: '새로운 투표를 생성합니다.',
  options: [
    {
      name: '질문',
      type: 'STRING',
      description: '투표 질문',
      required: true,
    },
    {
      name: '옵션1',
      type: 'STRING',
      description: '투표 옵션 1',
      required: true,
    },
    {
      name: '옵션2',
      type: 'STRING',
      description: '투표 옵션 2',
      required: true,
    },
    {
      name: '옵션3',
      type: 'STRING',
      description: '투표 옵션 3',
      required: false,
    },
    {
      name: '옵션4',
      type: 'STRING',
      description: '투표 옵션 4',
      required: false,
    },
  ],
  execute: async (client: Client, interaction: CommandInteraction) => {
    const question = interaction.options.getString('질문', true);
    const options = [
      interaction.options.getString('옵션1', true),
      interaction.options.getString('옵션2', true),
      interaction.options.getString('옵션3'),
      interaction.options.getString('옵션4'),
    ].filter((option): option is string => option !== null);

    const pollId = `${Date.now()}-${interaction.user.id}`;

    const newPoll: Poll = {
      pollId,
      question,
      options,
      votes: [],
      isActive: true,
    };

    polls.push(newPoll);

    // Debugging: Log the newly created poll
    console.log('New poll created:', newPoll);
    console.log('Current polls array:', polls);

    const buttons = new MessageActionRow().addComponents(
      options.map((option, index) =>
        new MessageButton()
          .setCustomId(`${pollId}-${index}`)
          .setLabel(option)
          .setStyle('PRIMARY')
      )
    );

    const endPollButton = new MessageButton()
      .setCustomId(`${pollId}-end`)
      .setLabel('투표 종료')
      .setStyle('DANGER');

    buttons.addComponents(endPollButton);

    await interaction.reply({
      content: `**${question}**\n옵션을 클릭하여 투표하세요.`,
      components: [buttons],
    });
  },
};
