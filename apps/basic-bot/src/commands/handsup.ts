import { SlashCommand } from '../types/slashCommand';
import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from 'discord.js';

interface UserRequest {
  userId: string;
  userName: string;
  requestCount: number;
  lastRequestTime: number;
}

const userRequests: UserRequest[] = [];

function isGuildMember(member: unknown): member is GuildMember {
  return (member as GuildMember).voice !== undefined;
}

export const handsUp: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('손들기')
    .setDescription('발언권 부여 기능'),
  execute: async (_, interaction: ChatInputCommandInteraction) => {
    if (!interaction.inGuild()) {
      await interaction.editReply({
        content: '이 명령어는 서버 내에서만 사용 가능합니다.',
      });
      return;
    }

    if (isGuildMember(interaction.member) && interaction.member.voice.channel) {
      const now = Date.now();
      const userId = interaction.user.id;
      const userName = interaction.user.displayName;
      const existingRequest = userRequests.find(
        (request) => request.userId === userId
      );

      if (existingRequest) {
        existingRequest.requestCount += 1;
        existingRequest.lastRequestTime = now;
      } else {
        userRequests.push({
          userId: userId,
          requestCount: 1,
          lastRequestTime: now,
          userName,
        });
      }

      // 발언권 부여 로직: 가장 적게 발언한 사람에게 우선권 부여
      userRequests.sort(
        (a, b) =>
          a.requestCount - b.requestCount ||
          a.lastRequestTime - b.lastRequestTime
      );
      const nextSpeaker = userRequests[0];

      await interaction.editReply(
        `${nextSpeaker.userName} 님에게 발언권이 부여되었습니다!`
      );
    } else {
      await interaction.editReply({
        content: '먼저 음성 채널에 입장해주세요.',
      });
    }
  },
};
