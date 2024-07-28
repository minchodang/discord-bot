import {
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Interaction,
} from 'discord.js';

import dotenv from 'dotenv';
import commands from '../commands';

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
    client.on('ready', async () => {
      if (client.application) {
        await client.application.commands.set(commands.map((cmd) => cmd.data));
        console.log('info: command registered');
      }
    });

    client.on('interactionCreate', async (interaction: Interaction) => {
      if (interaction.isChatInputCommand()) {
        await handleChatInputCommand(interaction);
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
      // 상호작용을 지연시킵니다.
      await interaction.deferReply();

      await currentCommand.execute(client, interaction);
      console.log(
        `info: command ${currentCommand.data.name} handled correctly`
      );
    } catch (error) {
      console.error(
        `Error handling command ${currentCommand.data.name}:`,
        error
      );
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply({
            content: '명령어 실행 중 오류가 발생했습니다.',
          });
        } else {
          await interaction.reply({
            content: '명령어 실행 중 오류가 발생했습니다.',
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error('Failed to send error message:', replyError);
      }
    }
  }
}

startBot();
