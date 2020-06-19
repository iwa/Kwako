import { Client, Message } from 'discord.js';
import { Db } from 'mongodb';

module.exports.run = async (bot: Client, msg: Message, args:string[], db:Db) => {
    if(!msg.member.hasPermission('MANAGE_GUILD')) return msg.delete();

    msg.channel.send(`**☁️ Please now use Kwako Web Dashboard to configure the bot**\nhttps://kwako.iwa.sh`);
};

module.exports.help = {
    name: 'setconf',
    usage: "setconf",
    desc: "Set a custom configuration for this Guild",
    staff: true
};