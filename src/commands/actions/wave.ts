import { Client, Message, MessageEmbed } from 'discord.js'
import utilities from '../../utils/utilities'
import { Logger } from 'pino';

let nbGifs = 6;
let lastGif = 0;

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    const embed = new MessageEmbed();
    embed.setColor('#F2DEB0')
    embed.setDescription(`**<@${msg.author.id}>** is waving!`)

    let n = utilities.randomInt(nbGifs)
    while (lastGif === n)
        n = utilities.randomInt(nbGifs);
    lastGif = n;

    embed.setImage(`https://${process.env.CDN_URL}/img/wave/${n}.gif`);

    return msg.channel.send(embed)
        .then(() => {
            log.info({msg: 'wave', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id});
        })
        .catch(log.error);
};

module.exports.help = {
    name: 'wave',
    usage: "wave",
    desc: "Waving!",
    perms: ['EMBED_LINKS']
};