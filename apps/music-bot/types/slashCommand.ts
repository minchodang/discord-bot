import {
  Client,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export interface SlashCommand {
  data: SlashCommandBuilder;
  execute: (
    client: Client,
    interaction: ChatInputCommandInteraction
  ) => Promise<void>;
}
