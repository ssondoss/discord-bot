import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { soundService } from '../services/SoundService';

export const data = new SlashCommandBuilder()
  .setName('list-sounds')
  .setDescription('List all uploaded sounds');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sounds = soundService.listAll();

  if (sounds.length === 0) {
    await interaction.reply('No sounds uploaded yet.');
    return;
  }

  const list = sounds.map(s => `• ${s.displayName}`).join('\n');
  await interaction.reply(`**Sounds (${sounds.length}):**\n${list}`);
}
