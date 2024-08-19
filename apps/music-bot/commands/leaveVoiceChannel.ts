import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';
import { getVoiceConnection } from '@discordjs/voice';

export const leaveVoiceChannel: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('나가')
    .setDescription(
      '봇이 현재 있는 음성 채널에서 나갑니다.'
    ) as SlashCommandBuilder,

  execute: async (client, interaction: ChatInputCommandInteraction) => {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.reply('음성 채널에 있지 않습니다.');
      return;
    }

    const connection = getVoiceConnection(voiceChannel.guild.id);

    if (connection) {
      connection.destroy(); // 음성 채널에서 연결을 끊음
      await interaction.editReply('음성 채널에서 나갑니다.');
    } else {
      await interaction.editReply(
        '봇이 현재 음성 채널에 연결되어 있지 않습니다.'
      );
    }
  },
};
