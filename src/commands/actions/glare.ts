import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    actionsRun(bot, msg, args, db, log, 'glare', 'glares', true);
};

module.exports.help = {
    name: 'glare',
    usage: "glare (mention someone) [someone else]",
    desc: "Glare at people by mentioning them",
    perms: ['EMBED_LINKS']
};