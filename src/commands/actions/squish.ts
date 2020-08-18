import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'squish', 'squishes', false);
};

module.exports.help = {
    name: 'squish',
    usage: "squish (mention someone) [someone else]",
    desc: "Squish people by mentioning them",
    perms: ['EMBED_LINKS']
};