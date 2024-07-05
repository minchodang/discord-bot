import { Client, Interaction, Intents } from 'discord.js';
import dotenv from 'dotenv';
import commands from './commands';
import { polls, Vote } from './commands/vote';

// Load environment variables from .env file
dotenv.config();

// Debugging: Check if BOT_TOKEN is loaded
console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
  ],
});

const startBot = async () => {
  try {
    await client.login(BOT_TOKEN);
    console.info('info: login success!');
    client.on('ready', async () => {
      if (client.application) {
        await client.application.commands.set(commands);
        console.log('info: command registered');
      }
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isCommand()) {
        if (interaction.commandName !== '투표생성') {
          await interaction.deferReply();
        }
        const currentCommand = commands.find(
          ({ name }) => name === interaction.commandName
        );
        if (currentCommand) {
          try {
            await currentCommand.execute(client, interaction);
            console.log(
              `info: command ${currentCommand.name} handled correctly`
            );
          } catch (error) {
            console.error(
              `Error handling command ${currentCommand.name}:`,
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
      } else if (interaction.isButton()) {
        // Debugging: Log interaction custom ID and polls array
        console.log('Button interaction received:', interaction.customId);
        console.log('Current polls:', polls);

        const match = interaction.customId.match(/^(.*)-(\d+|end)$/);
        if (!match) {
          console.error('Invalid custom ID format:', interaction.customId);
          await interaction.reply({
            content: '잘못된 버튼 ID입니다.',
            ephemeral: true,
          });
          return;
        }

        const pollId = match[1];
        const optionIndex = match[2];
        const poll = polls.find((p) => p.pollId === pollId);
        console.log('Found poll:', poll);

        if (poll) {
          if (optionIndex === 'end') {
            // 투표 종료 로직
            poll.isActive = false;
            try {
              await interaction.update({
                content: `투표가 종료되었습니다: ${poll.question}`,
                components: [],
              });
            } catch (error) {
              console.error('Error updating interaction:', error);
              if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                  content: '투표 종료 중 오류가 발생했습니다.',
                  ephemeral: true,
                });
              } else {
                await interaction.followUp({
                  content: '투표 종료 중 오류가 발생했습니다.',
                  ephemeral: true,
                });
              }
            }
          } else {
            // 투표 로직
            const vote: Vote = {
              option: poll.options[parseInt(optionIndex)],
              userId: interaction.user.id,
            };

            // 중복 투표 방지
            const existingVoteIndex = poll.votes.findIndex(
              (v) => v.userId === vote.userId
            );
            if (existingVoteIndex !== -1) {
              poll.votes[existingVoteIndex] = vote;
            } else {
              poll.votes.push(vote);
            }

            try {
              await interaction.reply({
                content: `투표가 완료되었습니다: ${vote.option}`,
                ephemeral: true,
              });
            } catch (error) {
              console.error('Error replying to interaction:', error);
              if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                  content: '투표 완료 중 오류가 발생했습니다.',
                  ephemeral: true,
                });
              } else {
                await interaction.followUp({
                  content: '투표 완료 중 오류가 발생했습니다.',
                  ephemeral: true,
                });
              }
            }
          }
        } else {
          try {
            await interaction.reply({
              content: '해당 투표를 찾을 수 없습니다.',
              ephemeral: true,
            });
          } catch (error) {
            console.error('Error replying to interaction:', error);
            if (!interaction.deferred && !interaction.replied) {
              await interaction.reply({
                content: '투표 찾기 중 오류가 발생했습니다.',
                ephemeral: true,
              });
            } else {
              await interaction.followUp({
                content: '투표 찾기 중 오류가 발생했습니다.',
                ephemeral: true,
              });
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('error: login failed', error);
  }
};

startBot();
