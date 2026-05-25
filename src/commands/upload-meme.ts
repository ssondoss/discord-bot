import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { memeService } from '../services/MemeService';
import { storageService } from '../services/StorageService';
import { sanitizeFilename, isValidDisplayName } from '../utils/sanitize';
import {
  isAllowedMemeType,
  normalizeContentType,
  MAX_MEME_SIZE,
} from '../utils/validators';

// Maps normalized MIME types to the file extension we store on disk.
const MIME_TO_EXT: Record<string, string> = {
  'image/png':  'png',
  'image/jpeg': 'jpg',
  'image/jpg':  'jpg',
  'image/gif':  'gif',
  'image/webp': 'webp',
};

export const data = new SlashCommandBuilder()
  .setName('upload-meme')
  .setDescription('Upload an image as a named meme')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name for this meme').setRequired(true),
  )
  .addAttachmentOption(opt =>
    opt.setName('file').setDescription('Image file (png/jpg/gif/webp, max 5 MB)').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const name       = interaction.options.getString('name', true).trim();
  const attachment = interaction.options.getAttachment('file', true);

  if (!isValidDisplayName(name)) {
    await interaction.editReply('Invalid name. Use letters, numbers, hyphens, and underscores only (max 50 chars).');
    return;
  }

  const mimeType = normalizeContentType(attachment.contentType ?? '');

  if (!isAllowedMemeType(mimeType)) {
    await interaction.editReply('Only image files are allowed. (png, jpg, gif, webp)');
    return;
  }

  if (attachment.size > MAX_MEME_SIZE) {
    await interaction.editReply('Image exceeds the 5 MB limit.');
    return;
  }

  const displayName = sanitizeFilename(name);

  if (memeService.exists(displayName)) {
    await interaction.editReply('A meme with this name already exists.');
    return;
  }

  const extension = MIME_TO_EXT[mimeType] ?? 'png';

  try {
    const { filename, filePath } = await storageService.saveMeme(displayName, attachment.url, extension);
    memeService.add(displayName, filename, filePath, mimeType);
    await interaction.editReply(`Meme uploaded successfully as: **${displayName}**`);
  } catch (err) {
    console.error('[upload-meme] Failed to save file:', err);
    await interaction.editReply('Failed to save the meme. Please try again.');
  }
}
