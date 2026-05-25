import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { streamService } from '../services/StreamService';

export const data = new SlashCommandBuilder()
  .setName('list-streams')
  .setDescription('List all saved stream URLs');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const streams = streamService.listAll();

  if (streams.length === 0) {
    await interaction.reply('No stream URLs saved yet.');
    return;
  }

  const list = streams.map(s => `• ${s.displayName}`).join('\n');
  await interaction.reply(`**Streams (${streams.length}):**\n${list}`);
}
