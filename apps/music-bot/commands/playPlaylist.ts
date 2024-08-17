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
import ytdl from '@distube/ytdl-core';
import { playlists } from '../types/playList';

export const playPlaylist: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('플레이리스트재생')
    .setDescription('플레이리스트에 있는 곡을 재생합니다')
    .addStringOption((option) =>
      option
        .setName('이름')
        .setDescription('플레이리스트 이름을 입력하세요')
        .setRequired(true)
    ) as SlashCommandBuilder,
  execute: async (client, interaction: ChatInputCommandInteraction) => {
    const guildId = interaction.guildId!;
    const playlistName = interaction.options.getString('이름', true);

    const playlist = playlists[guildId]?.find((pl) => pl.name === playlistName);

    if (!playlist || playlist.songs.length === 0) {
      await interaction.editReply(
        '플레이리스트를 찾을 수 없거나 비어있습니다.'
      );
      return;
    }

    const member = interaction.member as GuildMember;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      await interaction.editReply('음성 채널에 먼저 접속해주세요.');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    connection.subscribe(player);

    let currentSongIndex = 0;

    const playNextSong = () => {
      if (currentSongIndex >= playlist.songs.length) {
        connection.destroy();
        return;
      }

      const song = playlist.songs[currentSongIndex];
      currentSongIndex++;

      const stream = ytdl(song.url, {
        filter: 'audioonly',
        highWaterMark: 1 << 25,
      });
      const resource = createAudioResource(stream);
      player.play(resource);
    };

    // 이벤트 리스너를 등록하여 플레이어가 `Idle` 상태가 되면 다음 곡을 재생하도록 설정
    player.on(AudioPlayerStatus.Idle, playNextSong);

    playNextSong();

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });
    connection.on(VoiceConnectionStatus.Disconnected, () => {
      connection.destroy();
    });

    await interaction.editReply(
      `"${playlistName}" 플레이리스트 재생을 시작합니다.`
    );
  },
};
