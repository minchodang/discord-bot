import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { SlashCommand } from '../types/slashCommand';
import axios from 'axios';

export const search: SlashCommand = {
  name: '구글-검색',
  description: '구글에서 검색을 수행합니다.',
  options: [
    {
      required: true,
      name: '쿼리',
      description: '검색할 내용을 입력하세요.',
      type: ApplicationCommandOptionTypes.STRING,
    },
  ],
  execute: async (_, interaction) => {
    const query = interaction.options.get('쿼리')?.value || '';
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}`;

    try {
      const response = await axios.get(searchUrl);
      const items = response.data.items;
      if (items && items.length > 0) {
        const topResult = items[0];
        const title = topResult.title;
        const link = topResult.link;
        const snippet = topResult.snippet;

        await interaction.followUp({
          ephemeral: true,
          content: `**${title}**\n${snippet}\n[링크](${link})`,
        });
      } else {
        await interaction.followUp({
          ephemeral: true,
          content: '검색 결과가 없습니다.',
        });
      }
    } catch (error) {
      console.error('Error performing Google search:', error);
      await interaction.followUp({
        ephemeral: true,
        content: '구글 검색 중 오류가 발생했습니다.',
      });
    }
  },
};
