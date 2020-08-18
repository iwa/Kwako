import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'boop', 'boops', false);
};

module.exports.help = {
    name: 'boop',
    usage: "boop (mention someone) [someone else]",
    desc: "Boop people by mentioning them",
    perms: ['EMBED_LINKS']
};