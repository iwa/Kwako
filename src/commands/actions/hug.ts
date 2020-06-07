import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'hug');
};

module.exports.help = {
    name: 'hug',
    usage: "hug (mention someone) [someone else]",
    desc: "Hug people by mentioning them"
};