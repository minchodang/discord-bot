import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';
import axios from 'axios';

export const search: SlashCommand = {
  data: new SlashCommandBuilder()
    .addStringOption((option) =>
      option
        .setName('쿼리')
        .setDescription('검색할 내용을 입력하세요.')
        .setRequired(true)
    )
    .setName('구글-검색')
    .setDescription('구글에서 검색을 수행합니다.') as SlashCommandBuilder,
  execute: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const query = interaction.options.getString('쿼리') || '';
    const searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_CUSTOM_SEARCH_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}`;

    try {
      const response = await axios.get(searchUrl);
      const items = response.data.items;
      if (items && items.length > 0) {
        const topResult = items[0];
        const title = topResult.title;
        const link = topResult.link;
        const snippet = topResult.snippet;

        await interaction.editReply({
          content: `**${title}**\n${snippet}\n[링크](${link})`,
        });
      } else {
        await interaction.editReply({
          content: '검색 결과가 없습니다.',
        });
      }
    } catch (error) {
      console.error('Error performing Google search:', error);
      await interaction.editReply({
        content: '구글 검색 중 오류가 발생했습니다.',
      });
    }
  },
};
