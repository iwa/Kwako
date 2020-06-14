import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
const profile = require('./profile')

module.exports.run = (bot: Client, msg: Message, args: string[], db: Db) => {
    profile.run(bot, msg, args, db)
};

module.exports.help = {
    name: 'me',
    usage: "?me [mention someone]",
    desc: "Print your or someone's profile\n(alias of ?profile)"
};