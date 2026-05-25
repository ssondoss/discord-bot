import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import ffmpegStatic from 'ffmpeg-static';
import sodium from 'libsodium-wrappers';
import * as readyEvent        from './events/ready';
import * as interactionCreate from './events/interactionCreate';

async function main() {
  // libsodium-wrappers is async — voice encryption will silently fail
  // if we try to connect before this resolves.
  await sodium.ready;
  console.log('[Bot] Sodium initialized.');

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
      GatewayIntentBits.GuildVoiceStates,
    ],
  });

  readyEvent.register(client);
  interactionCreate.register(client);

  client.login(DISCORD_TOKEN);
}

main().catch((err) => {
  console.error('[Bot] Fatal startup error:', err);
  process.exit(1);
});
