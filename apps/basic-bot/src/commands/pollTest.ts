import {
  Client,
  SlashCommandBuilder,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';

export interface Vote {
  option: string;
  userId: string;
}

export const poll2: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('투표테스트')
    .setDescription('새로운 투표를 생성합니다.')
    .addStringOption((option) =>
      option.setName('질문').setDescription('투표 질문').setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('옵션1')
        .setDescription('첫 번째 투표 옵션')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('옵션2')
        .setDescription('두 번째 투표 옵션')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('옵션3')
        .setDescription('세 번째 투표 옵션')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('옵션4')
        .setDescription('네 번째 투표 옵션')
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName('옵션5')
        .setDescription('다섯 번째 투표 옵션')
        .setRequired(false)
    ) as SlashCommandBuilder,
  execute: async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;
    const { channel } = interaction;
    const options = interaction.options;
    const emojis: string[] = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

    const question = options.getString('질문');
    if (!question) {
      await interaction.reply({
        content: '질문을 입력해주세요.',
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder().setTitle(question).setColor('Green');

    const pollOptions = [];
    for (let i = 1; i <= 5; i++) {
      const optionValue = options.getString(`옵션${i}`);
      if (optionValue) {
        pollOptions.push(optionValue);
      }
    }

    if (pollOptions.length < 2) {
      await interaction.reply({
        content: '최소 2개의 옵션을 입력해주세요.',
        ephemeral: true,
      });
      return;
    }

    pollOptions.forEach((option, index) => {
      embed.addFields({
        name: `${emojis[index]} ${option}`,
        value: '\u200B', // 제로 너비 공백 문자
      });
    });

    if (channel) {
      const sentMessage = await channel.send({ embeds: [embed] });
      for (let i = 0; i < pollOptions.length; i++) {
        await sentMessage.react(emojis[i]);
      }
    }

    await interaction.reply({
      content: '투표가 성공적으로 생성되었습니다.',
      ephemeral: true,
    });
  },
};
