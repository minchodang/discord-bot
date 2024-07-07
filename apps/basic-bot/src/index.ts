import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Interaction,
  ModalSubmitInteraction,
} from 'discord.js';
import dotenv from 'dotenv';
import commands from './commands';
import { polls } from './store/pollStore';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const startBot = async () => {
  try {
    await client.login(BOT_TOKEN);
    console.info('info: login success!');
    client.on('ready', async () => {
      if (client.application) {
        await client.application.commands.set(commands.map((cmd) => cmd.data));
        console.log('info: command registered');
      }
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(interaction);
      } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction);
      } else if (interaction.isModalSubmit()) {
        await handleModalSubmit(interaction);
      }
    });
  } catch (error) {
    console.error('Error starting bot:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

async function handleChatInputCommand(
  interaction: ChatInputCommandInteraction
) {
  const currentCommand = commands.find(
    (cmd) => cmd.data.name === interaction.commandName
  );
  if (currentCommand) {
    try {
      if (interaction.commandName !== '투표생성') {
        await interaction.deferReply();
      }
      await currentCommand.execute(client, interaction);
      console.log(
        `info: command ${currentCommand.data.name} handled correctly`
      );
    } catch (error) {
      console.error(
        `Error handling command ${currentCommand.data.name}:`,
        error
      );
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: '명령어 실행 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: '명령어 실행 중 오류가 발생했습니다.',
          ephemeral: true,
        });
      }
    }
  }
}
async function handleButtonInteraction(interaction: ButtonInteraction) {
  const [pollId1, pollId2, optionIndex] = interaction.customId.split('-');
  console.log('interaction.customId:', interaction.customId); // 추가: customId 확인
  console.log('pollId:', pollId1, 'optionIndex:', optionIndex); // 추가: pollId와 optionIndex 확인
  console.log('polls:', polls); // 추가: 현재 polls 배열 확인
  const pollId = `${pollId1}-${pollId2}`;

  const pollIndex = polls.findIndex((p) => p.pollId === pollId);
  console.log('pollIndex:', pollIndex); // 추가: pollIndex 확인

  if (pollIndex === -1) {
    await interaction.reply({
      content: '투표를 찾을 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  const poll = polls[pollIndex];

  if (optionIndex === 'end') {
    poll.isActive = false;
    polls[pollIndex] = poll; // 업데이트된 poll을 polls 배열에 반영
    await interaction.update({
      content: `투표가 종료되었습니다: ${poll.question}`,
      components: [],
    });
    return;
  }

  const optionIndexNum = parseInt(optionIndex);
  const existingVoteIndex = poll.votes.findIndex(
    (v) => v.userId === interaction.user.id
  );

  if (existingVoteIndex !== -1) {
    if (poll.votes[existingVoteIndex].option === poll.options[optionIndexNum]) {
      // 같은 옵션을 다시 선택한 경우, 투표 취소
      poll.votes.splice(existingVoteIndex, 1);
    } else {
      // 다른 옵션을 선택한 경우, 투표 변경
      poll.votes[existingVoteIndex].option = poll.options[optionIndexNum];
    }
  } else {
    // 새로운 투표
    poll.votes.push({
      option: poll.options[optionIndexNum],
      userId: interaction.user.id,
    });
  }

  // 업데이트된 poll을 polls 배열에 반영
  polls[pollIndex] = poll;

  const updatedButtons = new ActionRowBuilder<ButtonBuilder>().addComponents(
    poll.options.map((option, index) => {
      const voteCount = poll.votes.filter((v) => v.option === option).length;
      return new ButtonBuilder()
        .setCustomId(`${pollId}-${index}`)
        .setLabel(`${option} (${voteCount})`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(!poll.isActive);
    })
  );

  const endPollButton = new ButtonBuilder()
    .setCustomId(`${pollId}-end`)
    .setLabel('투표 종료')
    .setStyle(ButtonStyle.Danger)
    .setDisabled(!poll.isActive);

  updatedButtons.addComponents(endPollButton);

  await interaction.update({
    content: `**${poll.question}**\n옵션을 클릭하여 투표하세요.`,
    components: [updatedButtons],
  });

  console.log('Updated polls:', polls); // 로그 추가
}

// 이 함수를 client.on('interactionCreate') 이벤트 핸들러에 추가하세요
async function handleModalSubmit(interaction: ModalSubmitInteraction) {
  if (!interaction.isModalSubmit()) return;

  const [pollId, optionIndex] = interaction.customId.split('-');
  const poll = polls.find((p) => p.pollId === pollId);

  if (!poll) {
    await interaction.reply({
      content: '투표를 찾을 수 없습니다.',
      ephemeral: true,
    });
    return;
  }

  const option = poll.options[parseInt(optionIndex)];
  const voters = poll.votes
    .filter((v) => v.option === option)
    .map((v) => `<@${v.userId}>`)
    .join('\n');

  await interaction.reply({
    content: `**${option}**에 투표한 사용자:\n${voters || '없음'}`,
    ephemeral: true,
  });
}

startBot();
