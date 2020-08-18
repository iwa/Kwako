import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return msg.delete();

    await msg.channel.send(`**☁️ Please now use Kwako Web Dashboard to configure the bot**\nhttps://kwako.iwa.sh`);

    Kwako.log.info({msg: 'setconf', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'setconf',
    usage: "setconf",
    desc: "Set a custom configuration for this Guild",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};