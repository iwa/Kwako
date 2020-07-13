import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'pat', 'pats', false);
};

module.exports.help = {
    name: 'patpat',
    usage: "patpat (mention someone) [someone else]",
    desc: "Pat people by mentioning them\n(alias of ?pat)",
    perms: ['EMBED_LINKS']
};