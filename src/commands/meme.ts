import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { memeService } from '../services/MemeService';
import { sanitizeFilename } from '../utils/sanitize';
import fs from 'fs';

export const data = new SlashCommandBuilder()
  .setName('meme')
  .setDescription('Retrieve a meme by name')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name of the meme').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  // Sanitize the lookup key so "My Meme!!" finds the same entry as "my_meme".
  const displayName = sanitizeFilename(interaction.options.getString('name', true));
  const meme = memeService.findByName(displayName);

  if (!meme) {
    await interaction.editReply('No meme found with this name.');
    return;
  }

  if (!fs.existsSync(meme.filePath)) {
    await interaction.editReply('Meme file is missing from storage.');
    return;
  }

  const attachment = new AttachmentBuilder(meme.filePath, { name: meme.filename });
  await interaction.editReply({ files: [attachment] });
}
