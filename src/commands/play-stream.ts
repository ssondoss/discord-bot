import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { streamService } from '../services/StreamService';
import { voiceService } from '../services/VoiceService';
import { sanitizeFilename } from '../utils/sanitize';

export const data = new SlashCommandBuilder()
  .setName('play-stream')
  .setDescription('Stream audio from a saved URL in your voice channel')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name of the stream').setRequired(true),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.deferReply();

  const member = interaction.member as GuildMember;

  if (!member?.voice?.channel) {
    await interaction.editReply('You must join a voice channel first.');
    return;
  }

  const displayName = sanitizeFilename(interaction.options.getString('name', true));
  const stream = streamService.findByName(displayName);

  if (!stream) {
    await interaction.editReply('No stream URL found with this name.');
    return;
  }

  try {
    await interaction.editReply(`Streaming **${stream.displayName}**...`);
    // Audio is piped live through ffmpeg — nothing is saved to disk.
    await voiceService.playStream(member, stream.url);
  } catch (err) {
    console.error('[play-stream] Stream error:', err);
    await interaction
      .followUp('An error occurred while streaming. The URL may be unreachable or unsupported.')
      .catch(() => {});
  }
}
