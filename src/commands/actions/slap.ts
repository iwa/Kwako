import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'slap', 'slaps', false);
};

module.exports.help = {
    name: 'slap',
    usage: "slap (mention someone) [someone else]",
    desc: "Slap people by mentioning them",
    perms: ['EMBED_LINKS']
};