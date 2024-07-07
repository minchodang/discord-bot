// src/commands/joke.ts
import { SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../types/slashCommand';
import axios from 'axios';

export const joke: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('랜덤 농담을 제공합니다.'),
  execute: async (client, interaction) => {
    try {
      const response = await axios.get(
        'https://official-joke-api.appspot.com/random_joke'
      );
      const { setup, punchline } = response.data;

      // 응답을 followUp으로 보냄
      await interaction.editReply(`${setup}\n${punchline}`);
    } catch (error) {
      console.error('Error fetching joke:', error);

      // 오류 발생 시 응답을 보냄
      if (!interaction.replied && !interaction.deferred) {
        await interaction.editReply('농담을 가져오는 중 오류가 발생했습니다.');
      }
    }
  },
};
