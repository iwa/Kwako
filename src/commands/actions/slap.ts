import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'slap');
};

module.exports.help = {
    name: 'slap',
    usage: "slap (mention someone) [someone else]",
    desc: "Slap people by mentioning them",
    perms: ['EMBED_LINKS']
};