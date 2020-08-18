import { Message } from 'discord.js'
import actionsRun from '../../utils/actions';

module.exports.run = (msg: Message, args: string[]) => {
    actionsRun(msg, args, 'pat', 'pats', false);
};

module.exports.help = {
    name: 'pat',
    aliases: ['patpat'],
    usage: "pat (mention someone) [someone else]",
    desc: "Pat people by mentioning them",
    perms: ['EMBED_LINKS']
};