import { Client, Interaction } from 'discord.js';
import dotenv from 'dotenv';
import commands from './commands';

// Load environment variables from .env file
dotenv.config();

// Debugging: Check if BOT_TOKEN is loaded
console.log('BOT_TOKEN:', process.env.BOT_TOKEN);

const BOT_TOKEN = process.env.BOT_TOKEN;

const client = new Client({ intents: [] });

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
    // 핸들링 로직 추가

    client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isCommand()) {
        const currentCommand = commands.find(
          ({ name }) => name === interaction.commandName
        );
        if (currentCommand) {
          await interaction.deferReply();
          currentCommand.execute(client, interaction);
          console.log(`info: command ${currentCommand.name} handled correctly`);
        }
      }
    });
  } catch (error) {
    console.error('error: login failed', error);
  }
};

startBot();
