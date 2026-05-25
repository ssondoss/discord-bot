import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} from '@discordjs/voice';
import { GuildMember, VoiceChannel } from 'discord.js';
import { spawn } from 'child_process';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';

class VoiceService {
  private get ffmpegPath(): string {
    if (!ffmpegStatic) throw new Error('ffmpeg binary not found (ffmpeg-static returned null).');
    return ffmpegStatic;
  }

  /**
   * Play a locally stored audio file in the member's voice channel.
   *
   * The audio file is read from disk and transcoded in real time by ffmpeg.
   * Nothing is downloaded or cached here — the file already lives in uploads/audio/.
   * The bot disconnects automatically once playback finishes.
   */
  async playLocalFile(member: GuildMember, filePath: string): Promise<void> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found on disk: ${filePath}`);
    }

    const voiceChannel = member.voice.channel as VoiceChannel;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

      // Spawn ffmpeg to transcode to raw signed-16-bit PCM (Discord's required format).
      const ffmpeg = spawn(this.ffmpegPath, [
        '-i', filePath,
        '-f', 's16le',  // raw PCM
        '-ar', '48000', // 48 kHz — Discord requirement
        '-ac', '2',     // stereo
        'pipe:1',
      ]);

      const resource = createAudioResource(ffmpeg.stdout!, { inputType: StreamType.Raw });
      const player = createAudioPlayer();
      connection.subscribe(player);
      player.play(resource);

      await new Promise<void>((resolve, reject) => {
        player.on(AudioPlayerStatus.Idle, () => resolve());
        player.on('error', reject);
        ffmpeg.on('error', reject);
      });
    } finally {
      connection.destroy();
    }
  }

  /**
   * Stream audio from a URL directly into a voice channel via ffmpeg.
   *
   * This is fundamentally different from playLocalFile:
   *   - No data is written to disk at any point.
   *   - ffmpeg fetches and decodes the URL on the fly and pipes raw PCM to Discord.
   *   - The -reconnect flags allow brief network interruptions to recover gracefully.
   *
   * The bot disconnects when the stream ends or an error occurs.
   */
  async playStream(
    member: GuildMember,
    url: string,
    startTime?: string,
    endTime?: string,
  ): Promise<void> {
    const voiceChannel = member.voice.channel as VoiceChannel;
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

      // -ss before -i does a fast keyframe seek — accurate enough for audio.
      // -to is the absolute end timestamp in the source (not duration).
      const args: string[] = [
        '-reconnect',           '1',
        '-reconnect_streamed',  '1',
        '-reconnect_delay_max', '5',
        ...(startTime ? ['-ss', startTime] : []),
        '-i', url,
        ...(endTime   ? ['-to', endTime]   : []),
        '-vn',
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1',
      ];

      const ffmpeg = spawn(this.ffmpegPath, args);

      const resource = createAudioResource(ffmpeg.stdout!, { inputType: StreamType.Raw });
      const player = createAudioPlayer();
      connection.subscribe(player);
      player.play(resource);

      await new Promise<void>((resolve, reject) => {
        player.on(AudioPlayerStatus.Idle, () => resolve());
        player.on('error', reject);
        ffmpeg.on('error', reject);
      });
    } finally {
      connection.destroy();
    }
  }
}

export const voiceService = new VoiceService();
