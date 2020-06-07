import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'pat');
};

module.exports.help = {
    name: 'pat',
    usage: "pat (mention someone) [someone else]",
    desc: "Pat people by mentioning them"
};