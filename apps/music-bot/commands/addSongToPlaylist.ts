import { SlashCommand } from '../types/slashCommand';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { google, youtube_v3 } from 'googleapis';
import { Playlist, playlists } from '../types/playList';
const youtube = google.youtube({
  version: 'v3',
});

export const addSongToPlaylist: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('플레이리스트추가')
    .setDescription('플레이리스트에 곡을 추가합니다')
    .addStringOption((option) =>
      option
        .setName('이름')
        .setDescription('플레이리스트 이름을 입력하세요')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('노래')
        .setDescription('추가할 노래 제목을 입력하세요')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (_, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const playlistName = interaction.options.getString('이름', true);
    const songTitle = interaction.options.getString('노래', true);

    const playlist = playlists[guildId]?.find(
      (pl: Playlist) => pl.name === playlistName
    );
    if (!playlist) {
      await interaction.editReply('플레이리스트를 찾을 수 없습니다.');
      return;
    }

    // YouTube에서 곡 검색 (searchMusic과 동일한 방식)
    const params: youtube_v3.Params$Resource$Search$List = {
      part: ['snippet'],
      q: songTitle,
      maxResults: 1,
      type: ['video'],
      key: process.env.YOUTUBE_API_KEY,
    };
    const res = await youtube.search.list(params);

    const video = res.data.items?.[0];

    if (!video) {
      await interaction.editReply('노래를 찾을 수 없습니다.');
      return;
    }

    const videoUrl = `https://www.youtube.com/watch?v=${video.id?.videoId}`;

    playlist.songs.push({
      title: video.snippet?.title || songTitle,
      url: videoUrl,
    });

    await interaction.editReply(
      `"${songTitle}" 노래가 "${playlistName}" 플레이리스트에 추가되었습니다.`
    );
  },
};
