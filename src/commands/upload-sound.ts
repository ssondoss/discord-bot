import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { soundService } from '../services/SoundService';
import { storageService } from '../services/StorageService';
import { sanitizeFilename, isValidDisplayName } from '../utils/sanitize';
import {
  isAllowedSoundType,
  normalizeContentType,
  MAX_SOUND_SIZE,
} from '../utils/validators';

const MIME_TO_EXT: Record<string, string> = {
  'audio/mpeg':    'mp3',
  'audio/mp3':     'mp3',
  'audio/wav':     'wav',
  'audio/wave':    'wav',
  'audio/x-wav':   'wav',
  'audio/ogg':     'ogg',
  'audio/vorbis':  'ogg',
};

export const data = new SlashCommandBuilder()
  .setName('upload-sound')
  .setDescription('Upload a short audio file as a named sound')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name for this sound').setRequired(true),
  )
  .addAttachmentOption(opt =>
    opt.setName('file').setDescription('Audio file (mp3/wav/ogg, max 3 MB)').setRequired(true),
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

  if (!isAllowedSoundType(mimeType)) {
    await interaction.editReply('Only audio files are allowed. (mp3, wav, ogg)');
    return;
  }

  if (attachment.size > MAX_SOUND_SIZE) {
    await interaction.editReply('Audio exceeds the 3 MB limit.');
    return;
  }

  const displayName = sanitizeFilename(name);

  if (soundService.exists(displayName)) {
    await interaction.editReply('A sound with this name already exists.');
    return;
  }

  const extension = MIME_TO_EXT[mimeType] ?? 'mp3';

  try {
    const { filename, filePath } = await storageService.saveSound(displayName, attachment.url, extension);
    soundService.add(displayName, filename, filePath, mimeType);
    await interaction.editReply(`Sound uploaded successfully as: **${displayName}**`);
  } catch (err) {
    console.error('[upload-sound] Failed to save file:', err);
    await interaction.editReply('Failed to save the sound. Please try again.');
  }
}
