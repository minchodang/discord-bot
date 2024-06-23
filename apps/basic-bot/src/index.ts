import { Client } from 'discord.js';

const BOT_TOKEN = 'test';

const client = new Client({ intents: [] });

const startBot = async () => {
  await client.login(BOT_TOKEN);
  console.info('info:login success!');
};

startBot();
