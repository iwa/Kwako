import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js';

module.exports.run = async (msg: Message) => {
    let message = msg.content;

    if(message.length > 2048) return msg.channel.send({'embed':{
        'title': ":x: The announcement can't be over 2048 characters."
    }})

    let announce = new MessageEmbed();
    announce.setDescription(message);

    await msg.channel.send(announce).catch(res => {
        Kwako.log.error(res);
    })
};

module.exports.help = {
    name: 'announce',
    usage: "announce (message)",
    premium: true,
    desc: "Use Kwako to announce something.",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES']
};