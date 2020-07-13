import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'squish', 'squishes', false);
};

module.exports.help = {
    name: 'squish',
    usage: "squish (mention someone) [someone else]",
    desc: "Squish people by mentioning them",
    perms: ['EMBED_LINKS']
};