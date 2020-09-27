import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'kiss', 'kisses', false);
};

module.exports.help = {
    name: 'kiss',
    aliases: ['peck'],
    usage: "kiss (mention someone) [someone else]",
    desc: "Kiss people by mentioning them",
    perms: ['EMBED_LINKS'],
    premium: true
};