import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'glare', 'glares', true);
};

module.exports.help = {
    name: 'glare',
    usage: "glare (mention someone) [someone else]",
    desc: "Glare at people by mentioning them",
    perms: ['EMBED_LINKS']
};