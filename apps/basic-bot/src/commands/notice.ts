import { SlashCommandBuilder, ChannelType, TextChannel } from 'discord.js';
import { SlashCommand } from '../types/slashCommand';

export const notice: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('공지사항')
    .setDescription('공지사항 채널에 공지사항을 올립니다.')
    .addStringOption((option) =>
      option.setName('제목').setDescription('공지사항의 제목').setRequired(true)
    )
    .addAttachmentOption((option) =>
      option.setName('sss').setDescription('공지사항의 내').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('내용').setDescription('공지사항의 내용').setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('채널')
        .setDescription('공지사항을 올릴 채널')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ) as SlashCommandBuilder,

  async execute(_, interaction) {
    const title = interaction.options.getString('제목');
    const content = interaction.options.getString('내용');
    const channel = interaction.options.getChannel('채널') as TextChannel;

    const template = `
# ${title}

${content}

작성자: ${interaction.user}
작성일: ${new Date().toLocaleDateString('ko-KR')}
    `;

    await interaction.editReply({
      content: '다음 공지사항이 작성되었습니다. 수정이 필요하면 수정해주세요:',
    });

    // 여기에 메시지 수정 로직 추가

    await channel.send(template);
    await interaction.followUp({
      content: '공지사항이 게시되었습니다.',
      ephemeral: true,
    });
  },
};
