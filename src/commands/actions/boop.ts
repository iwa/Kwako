import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import actionsRun from '../../utils/actions';

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    actionsRun(bot, msg, args, db, 'boop');
};

module.exports.help = {
    name: 'boop',
    usage: "boop (mention someone) [someone else]",
    desc: "Boop people by mentioning them"
};