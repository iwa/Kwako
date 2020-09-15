import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'yeet', 'yeet', false);
};

module.exports.help = {
    name: 'Yeet',
    usage: "Yeet (mention someone) [someone else]",
    desc: "Yeet people by mentioning them",
    perms: ['EMBED_LINKS'],
    premium: true
};