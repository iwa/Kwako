import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'hug', 'hugs', false);
};

module.exports.help = {
    name: 'hug',
    usage: "hug (mention someone) [someone else]",
    desc: "Hug people by mentioning them",
    perms: ['EMBED_LINKS']
};