import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'glare', 'glares', true);
};

module.exports.help = {
    name: 'glare',
    usage: "glare (mention someone) [someone else]",
    desc: "Glare at people by mentioning them",
    perms: ['EMBED_LINKS']
};