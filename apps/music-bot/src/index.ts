import { Client, GatewayIntentBits } from 'discord.js';

import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.MUSIC_BOT_TOKEN;

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
    client.on('ready', async () => {});
  } catch (error) {
    console.error('Error starting bot:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
};

startBot();
