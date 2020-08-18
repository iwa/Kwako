import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'tickle', 'tickles', false);
};

module.exports.help = {
    name: 'tickle',
    usage: "tickle (mention someone) [someone else]",
    desc: "Tickle people by mentioning them",
    perms: ['EMBED_LINKS']
};