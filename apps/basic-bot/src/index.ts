import { Client, Interaction, Intents } from 'discord.js';
import dotenv from 'dotenv';
import commands from './commands';

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
        const currentCommand = commands.find(
          ({ name }) => name === interaction.commandName
        );
        if (currentCommand) {
          await interaction.deferReply();
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
            await interaction.followUp({
              content: '명령어 실행 중 오류가 발생했습니다.',
              ephemeral: true,
            });
          }
        }
      }
    });
  } catch (error) {
    console.error('error: login failed', error);
  }
};

startBot();
