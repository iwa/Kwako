import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'tongueout', 'tongueouts', true);
};

module.exports.help = {
    name: 'tongueout',
    usage: "tongueout (mention someone) [someone else]",
    desc: "Stick your tongue out at people by mentioning them",
    perms: ['EMBED_LINKS'],
    premium: true
};