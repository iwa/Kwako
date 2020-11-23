import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'cuddle', 'cuddles', false);
};

module.exports.help = {
    name: 'cuddle',
    premium: true,
    usage: "cuddle (mention someone) [someone else]",
    desc: "Cuddle people by mentioning them",
    perms: ['EMBED_LINKS']
};