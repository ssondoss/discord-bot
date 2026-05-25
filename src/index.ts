import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import ffmpegStatic from 'ffmpeg-static';
import * as readyEvent         from './events/ready';
import * as interactionCreate  from './events/interactionCreate';

// Expose the ffmpeg-static binary path so prism-media (used internally by
// @discordjs/voice) can locate ffmpeg without it needing to be in PATH.
if (ffmpegStatic) {
  process.env.FFMPEG_PATH = ffmpegStatic;
}

const { DISCORD_TOKEN } = process.env;
if (!DISCORD_TOKEN) {
  console.error('[Bot] DISCORD_TOKEN is not set. Add it to your .env file.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // required to see which voice channel a member is in
  ],
});

readyEvent.register(client);
interactionCreate.register(client);

client.login(DISCORD_TOKEN);
