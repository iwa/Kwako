import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'yeet', 'yeets', false);
};

module.exports.help = {
    name: 'yeet',
    usage: "Yeet (mention someone) [someone else]",
    desc: "Yeet people by mentioning them",
    perms: ['EMBED_LINKS'],
    premium: true
};