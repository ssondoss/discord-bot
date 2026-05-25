import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check if the bot is alive');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply('Pong!');
}
