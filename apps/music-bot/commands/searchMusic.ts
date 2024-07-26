import { SlashCommand } from '../types/slashCommand';
import { SlashCommandBuilder } from 'discord.js';
import { google } from 'googleapis';

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY, // YouTube API 키를 환경 변수에서 가져옵니다.
});

export const searchMusic: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('음악검색')
    .setDescription('유튜브에서 음악을 검색합니다')
    .addStringOption((option) =>
      option
        .setName('노래')
        .setDescription('검색할 노래 제목을 입력하세요')
        .setRequired(true)
    ),
  execute: async (_, interaction) => {
    // _ 대신 interaction 직접 사용
    const query = interaction.options.getString('노래', true);

    try {
      const res = await youtube.search.list({
        part: 'snippet',
        q: query,
        maxResults: 1,
        type: 'video',
      });

      const video = res.data.items?.[0];

      if (video) {
        const videoUrl = `https://www.youtube.com/watch?v=${video.id?.videoId}`;
        await interaction.editReply(
          `검색 결과: [${video.snippet?.title}](${videoUrl})`
        );
      } else {
        await interaction.editReply('검색 결과를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('YouTube API 에러:', error);
      await interaction.editReply('음악 검색 중 오류가 발생했습니다.');
    }
  },
};
