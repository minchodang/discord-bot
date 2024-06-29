import { SlashCommand } from '../types/slashCommand';
import axios from 'axios';

export const joke: SlashCommand = {
  name: 'joke',
  description: '랜덤 농담을 제공합니다.',
  options: [],
  execute: async (_, interaction) => {
    try {
      const response = await axios.get(
        'https://official-joke-api.appspot.com/random_joke'
      );
      const { setup, punchline } = response.data;

      // 응답을 followUp으로 보냄
      await interaction.followUp(`${setup}\n${punchline}`);
    } catch (error) {
      console.error('Error fetching joke:', error);

      // 오류 발생 시 응답을 보냄
      if (!interaction.replied && !interaction.deferred) {
        await interaction.followUp('농담을 가져오는 중 오류가 발생했습니다.');
      }
    }
  },
};
