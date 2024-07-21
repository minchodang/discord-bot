import {
  ActionRowBuilder,
  ChannelType,
  ChatInputCommandInteraction,
  Client,
  ComponentType,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { SlashCommand } from '../types/slashCommand';

export const notice: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('공지사항')
    .setDescription('공지사항을 작성합니다.')
    .addChannelOption((option) =>
      option
        .setName('채널')
        .setDescription('메시지를 가져올 채널')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    ) as SlashCommandBuilder,

  async execute(client: Client, interaction: ChatInputCommandInteraction) {
    const channel = interaction.options.getChannel('채널') as TextChannel;

    let lastMessageContent = '';
    try {
      const messages = await channel.messages.fetch({ limit: 1 });
      const lastMessage = messages.first();
      if (lastMessage) {
        lastMessageContent = lastMessage.content;
      }
    } catch (error) {
      console.error('메시지 가져오기 실패:', error);
      await interaction.reply('메시지를 가져오는 데 실패했습니다.');
      return;
    }

    const modal = new ModalBuilder()
      .setCustomId('noticeModal')
      .setTitle('공지사항 작성');

    const contentInput = new TextInputBuilder()
      .setCustomId('contentInput')
      .setLabel('공지사항 내용')
      .setStyle(TextInputStyle.Paragraph)
      .setValue(lastMessageContent)
      .setRequired(true);

    const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
      contentInput
    );
    modal.addComponents(actionRow);

    await interaction.showModal(modal);

    // 모달 제출 대기
    const filter = (i: ModalSubmitInteraction) => i.customId === 'noticeModal';
    try {
      const submission = await interaction.awaitModalSubmit({
        filter,
        time: 60000,
      });

      let noticeContent = submission.fields.getTextInputValue('contentInput');

      // 멘션 처리
      noticeContent = await processMentions(noticeContent, interaction);

      // 채널 선택 메뉴 생성
      const channels = interaction.guild?.channels.cache.filter(
        (channel): channel is TextChannel =>
          channel.type === ChannelType.GuildText
      );

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('channelSelect')
        .setPlaceholder('공지를 전송할 채널을 선택하세요')
        .addOptions(
          channels?.map((channel) => ({
            label: channel.name,
            value: channel.id,
          })) || []
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu
      );

      await submission.reply({
        content: '공지를 전송할 채널을 선택하세요:',
        components: [row],
        ephemeral: true,
      });

      // 채널 선택 대기
      const channelSelection = await interaction.channel?.awaitMessageComponent(
        {
          filter: (i) =>
            i.customId === 'channelSelect' &&
            i.user.id === interaction.user.id &&
            i.componentType === ComponentType.StringSelect,
          time: 60000,
        }
      );

      if (channelSelection && channelSelection.isStringSelectMenu()) {
        const selectedChannelId = channelSelection.values[0];
        const selectedChannel = client.channels.cache.get(selectedChannelId);

        if (selectedChannel && selectedChannel.type === ChannelType.GuildText) {
          await selectedChannel.send(noticeContent);
          await channelSelection.update({
            content: `공지사항이 ${selectedChannel.name} 채널에 전송되었습니다.`,
            components: [],
          });
        } else {
          await channelSelection.update({
            content: '선택한 채널을 찾을 수 없거나 텍스트 채널이 아닙니다.',
            components: [],
          });
        }
      }
    } catch (error) {
      console.error('모달 제출 또는 채널 선택 중 오류 발생:', error);
      await interaction.followUp({
        content: '공지사항 작성 또는 채널 선택 중 오류가 발생했습니다.',
        ephemeral: true,
      });
    }
  },
};

async function processMentions(
  content: string,
  interaction: ChatInputCommandInteraction
): Promise<string> {
  const mentionRegex = /@(everyone|here|[!&]?\d+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const mention = match[1];
    if (mention === 'everyone' || mention === 'here') {
      // @everyone과 @here는 그대로 유지
      continue;
    }

    const id = mention.replace(/[!&]/g, '');
    if (interaction.guild) {
      const member = await interaction.guild.members
        .fetch(id)
        .catch(() => null);
      if (member) {
        content = content.replace(match[0], `@${id}`);
        continue;
      }

      const role = await interaction.guild.roles.fetch(id).catch(() => null);
      if (role) {
        content = content.replace(match[0], `@&${id}`);
        continue;
      }

      const channel = interaction.guild.channels.cache.get(id);
      if (channel) {
        content = content.replace(match[0], `#${id}`);
        continue;
      }
    }
  }

  return content;
}
