import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { memeService } from '../services/MemeService';

export const data = new SlashCommandBuilder()
  .setName('list-memes')
  .setDescription('List all uploaded memes');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const memes = memeService.listAll();

  if (memes.length === 0) {
    await interaction.reply('No memes uploaded yet.');
    return;
  }

  const list = memes.map(m => `• ${m.displayName}`).join('\n');
  await interaction.reply(`**Memes (${memes.length}):**\n${list}`);
}
