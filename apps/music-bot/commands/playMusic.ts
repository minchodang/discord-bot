import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import { google, youtube_v3 } from 'googleapis';
import ytdl from '@distube/ytdl-core';

const youtube = google.youtube({
  version: 'v3',
});

export const searchAndPlayMusic: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('음악재생')
    .setDescription('유튜브에서 음악을 검색하고 재생합니다')
    .addStringOption((option) =>
      option
        .setName('노래')
        .setDescription('검색할 노래 제목을 입력하세요')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (client, interaction: ChatInputCommandInteraction) => {
    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply('음성 채널에 먼저 접속해주세요.');
      return;
    }

    const query = interaction.options.getString('노래', true);

    try {
      // YouTube에서 검색
      const params: youtube_v3.Params$Resource$Search$List = {
        part: ['snippet'],
        q: query,
        maxResults: 1,
        type: ['video'],
        key: process.env.YOUTUBE_API_KEY, // API 키를 직접 설정
      };
      const res = await youtube.search.list(params);

      const video = res.data.items?.[0];

      if (!video) {
        await interaction.editReply('검색 결과를 찾을 수 없습니다.');
        return;
      }

      const videoId = video.id?.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      // 음성 채널에 접속하여 음악 재생
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      // @distube/ytdl-core를 사용하여 오디오 스트림 가져오기
      const stream = ytdl(videoUrl, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
      });
      const resource = createAudioResource(stream);
      const player = createAudioPlayer();

      connection.subscribe(player);
      player.play(resource);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
      });
      connection.on(VoiceConnectionStatus.Disconnected, () => {
        connection.destroy();
      });

      await interaction.editReply(
        `재생 중: [${video.snippet?.title}](${videoUrl})`
      );
    } catch (error) {
      console.error('음악 재생 중 오류 발생:', error);
      await interaction.editReply('음악 재생 중 오류가 발생했습니다.');
    }
  },
};
