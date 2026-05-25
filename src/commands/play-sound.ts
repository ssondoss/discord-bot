import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { soundService } from '../services/SoundService';
import { voiceService } from '../services/VoiceService';
import { sanitizeFilename } from '../utils/sanitize';

export const data = new SlashCommandBuilder()
  .setName('play-sound')
  .setDescription('Play an uploaded sound in your voice channel')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name of the sound').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;

  if (!member?.voice?.channel) {
    await interaction.editReply('You must join a voice channel first.');
    return;
  }

  const displayName = sanitizeFilename(interaction.options.getString('name', true));
  const sound = soundService.findByName(displayName);

  if (!sound) {
    await interaction.editReply('No sound found with this name.');
    return;
  }

  try {
    await interaction.editReply(`Playing **${sound.displayName}**...`);
    await voiceService.playLocalFile(member, sound.filePath);
  } catch (err) {
    console.error('[play-sound] Playback error:', err);
    await interaction.followUp('An error occurred while playing the sound.').catch(() => {});
  }
}
