import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
import utilities from '../../utils/utilities'

let nbGifs = 5;
let lastGif = 0;

module.exports.run = async (msg: Message) => {
    const embed = new MessageEmbed();
    embed.setColor('#F2DEB0')
    embed.setDescription(`**<@${msg.author.id}>**, facepalm!`)

    let n = utilities.randomInt(nbGifs)
    while (lastGif === n)
        n = utilities.randomInt(nbGifs);
    lastGif = n;

    embed.setImage(`https://${process.env.CDN_URL}/img/facepalm/${n}.gif`);

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