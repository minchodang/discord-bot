import { playlists } from '../types/playList';
import { SlashCommand } from '../types/slashCommand';
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const createPlaylist: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('플레이리스트생성')
    .setDescription('새로운 플레이리스트를 생성합니다')
    .addStringOption((option) =>
      option
        .setName('이름')
        .setDescription('플레이리스트 이름을 입력하세요')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (_, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const playlistName = interaction.options.getString('이름', true);

    if (!playlists[guildId]) {
      playlists[guildId] = [];
    }

    const existingPlaylist = playlists[guildId].find(
      (pl) => pl.name === playlistName
    );

    if (existingPlaylist) {
      await interaction.editReply('이미 존재하는 플레이리스트입니다.');
      return;
    }

    playlists[guildId].push({ name: playlistName, songs: [] });
    await interaction.editReply(
      `플레이리스트 "${playlistName}"가 생성되었습니다.`
    );
  },
};
