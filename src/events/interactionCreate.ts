import { Client, ChatInputCommandInteraction, Interaction } from 'discord.js';
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

type Command = {
  data: { name: string };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands: Record<string, Command> = {
  'ping':           ping,
  'upload-meme':    uploadMeme,
  'meme':           meme,
  'list-memes':     listMemes,
  'upload-sound':   uploadSound,
  'play-sound':     playSound,
  'add-stream-url': addStreamUrl,
  'play-stream':    playStream,
  'list-sounds':    listSounds,
  'list-streams':   listStreams,
};

export function register(client: Client): void {
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];
    if (!command) {
      console.warn(`[Bot] Unknown command received: ${interaction.commandName}`);
      return;
    }

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(`[Bot] Error in /${interaction.commandName}:`, err);
      const msg = 'An unexpected error occurred.';
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(msg).catch(() => {});
      } else {
        await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
      }
    }
  });
}
