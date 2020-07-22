import { Client, Message } from 'discord.js';
import { Db } from 'mongodb';

module.exports.run = async (bot: Client, msg: Message) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA || process.env.SUDO == '0')) return msg.delete();

    msg.channel.send(`**☁️ Please now use Kwako Web Dashboard to configure the bot**\nhttps://kwako.iwa.sh`);
};

module.exports.help = {
    name: 'setconf',
    usage: "setconf",
    desc: "Set a custom configuration for this Guild",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};