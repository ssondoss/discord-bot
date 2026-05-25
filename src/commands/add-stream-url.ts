import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { streamService } from '../services/StreamService';
import { sanitizeFilename, isValidDisplayName } from '../utils/sanitize';
import { isValidUrl } from '../utils/validators';

export const data = new SlashCommandBuilder()
  .setName('add-stream-url')
  .setDescription('Save an audio stream URL by name')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name for this stream').setRequired(true),
  )
  .addStringOption(opt =>
    opt.setName('url').setDescription('HTTP/HTTPS URL to stream audio from').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const name = interaction.options.getString('name', true).trim();
  const url  = interaction.options.getString('url', true).trim();

  if (!isValidDisplayName(name)) {
    await interaction.reply('Invalid name. Use letters, numbers, hyphens, and underscores only (max 50 chars).');
    return;
  }

  if (!isValidUrl(url)) {
    await interaction.reply('Invalid URL. Must start with http:// or https://');
    return;
  }

  const displayName = sanitizeFilename(name);

  if (streamService.exists(displayName)) {
    await interaction.reply('A stream URL with this name already exists.');
    return;
  }

  try {
    streamService.add(displayName, url);
    await interaction.reply(`Stream URL saved successfully as: **${displayName}**`);
  } catch (err) {
    console.error('[add-stream-url] DB error:', err);
    await interaction.reply('Failed to save the stream URL. Please try again.');
  }
}
