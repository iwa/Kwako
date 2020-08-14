import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    actionsRun(bot, msg, args, db, log, 'hug', 'hugs', false);
};

module.exports.help = {
    name: 'hug',
    usage: "hug (mention someone) [someone else]",
    desc: "Hug people by mentioning them",
    perms: ['EMBED_LINKS']
};