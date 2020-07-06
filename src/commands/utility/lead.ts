import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'
const lead = require('./leaderboard')

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    lead.run(bot, msg, args, db);
};

module.exports.help = {
    name: 'lead',
    usage: "lead",
    desc: "Show the exp points leaderboard of the server\n(alias of `leaderboard`)",
    perms: ['EMBED_LINKS']
};