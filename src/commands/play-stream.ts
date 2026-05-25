import { SlashCommandBuilder, ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { streamService } from '../services/StreamService';
import { voiceService } from '../services/VoiceService';
import { sanitizeFilename } from '../utils/sanitize';

export const data = new SlashCommandBuilder()
  .setName('play-stream')
  .setDescription('Stream audio from a saved URL in your voice channel')
  .addStringOption(opt =>
    opt.setName('name').setDescription('Name of the stream').setRequired(true),
  )
  .addStringOption(opt =>
    opt.setName('start').setDescription('Start time (e.g. 1:30 or 00:01:30)').setRequired(false),
  )
  .addStringOption(opt =>
    opt.setName('end').setDescription('End time (e.g. 2:00 or 00:02:00)').setRequired(false),
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

  const start = interaction.options.getString('start') ?? undefined;
  const end   = interaction.options.getString('end')   ?? undefined;

  const label = start || end
    ? ` (${start ?? '0:00'} → ${end ?? 'end'})`
    : '';

  try {
    await interaction.editReply(`Streaming **${stream.displayName}**${label}...`);
    // Audio is piped live through ffmpeg — nothing is saved to disk.
    await voiceService.playStream(member, stream.url, start, end);
  } catch (err) {
    console.error('[play-stream] Stream error:', err);
    await interaction
      .followUp('An error occurred while streaming. The URL may be unreachable or unsupported.')
      .catch(() => {});
  }
}
