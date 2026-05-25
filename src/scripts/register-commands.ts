import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import * as ping         from '../commands/ping';
import * as uploadMeme   from '../commands/upload-meme';
import * as meme         from '../commands/meme';
import * as listMemes    from '../commands/list-memes';
import * as uploadSound  from '../commands/upload-sound';
import * as playSound    from '../commands/play-sound';
import * as addStreamUrl from '../commands/add-stream-url';
import * as playStream   from '../commands/play-stream';
import * as listSounds   from '../commands/list-sounds';
import * as listStreams   from '../commands/list-streams';

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('Missing DISCORD_TOKEN, CLIENT_ID, or GUILD_ID in .env');
  process.exit(1);
}

const commandData = [
  ping, uploadMeme, meme, listMemes,
  uploadSound, playSound,
  addStreamUrl, playStream,
  listSounds, listStreams,
].map(cmd => cmd.data.toJSON());

const rest = new REST().setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Registering ${commandData.length} slash commands to guild ${GUILD_ID}...`);
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commandData });
    console.log('All commands registered successfully.');
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
