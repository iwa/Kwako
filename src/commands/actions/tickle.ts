import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'tickle', 'tickles', false);
};

module.exports.help = {
    name: 'tickle',
    usage: "tickle (mention someone) [someone else]",
    desc: "Tickle people by mentioning them",
    perms: ['EMBED_LINKS']
};