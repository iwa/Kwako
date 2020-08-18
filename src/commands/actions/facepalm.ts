import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = async (msg: Message) => {
    const embed = new MessageEmbed();
    embed.setColor('#F2DEB0')
    embed.setDescription(`**<@${msg.author.id}>**, facepalm!`)
    embed.setImage('https://i.imgur.com/zqUDpIk.gif');

    return msg.channel.send(embed)
        .then(() => {
            Kwako.log.info({msg: 'facepalm', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
        })
        .catch(Kwako.log.error);
};

module.exports.help = {
    name: 'facepalm',
    usage: "facepalm",
    desc: "Do a facepalm",
    perms: ['EMBED_LINKS']
};