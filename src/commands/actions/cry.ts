import { Client, Message, MessageEmbed } from 'discord.js'
import utilities from '../../utils/utilities'
import { Logger } from 'pino';

let nbGifs = 9;
let lastGif = 0;

module.exports.run = async (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    const embed = new MessageEmbed();
    embed.setColor('#F2DEB0')
    embed.setDescription(`**<@${msg.author.id}>** is crying...`)

    let n = utilities.randomInt(nbGifs)
    while (lastGif === n)
        n = utilities.randomInt(nbGifs);
    lastGif = n;

    embed.setImage(`https://${process.env.CDN_URL}/img/cry/${n}.gif`);

    return msg.channel.send(embed)
        .then(() => {
            log.info({msg: 'cry', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
        })
        .catch(console.error);
};

module.exports.help = {
    name: 'cry',
    usage: "cry",
    desc: "Cry :(",
    perms: ['EMBED_LINKS']
};