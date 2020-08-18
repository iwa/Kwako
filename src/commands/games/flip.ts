import Kwako from '../../Client'
import { Message } from 'discord.js'
import utilities from '../../utils/utilities'

module.exports.run = (msg: Message) => {
    let n = utilities.randomInt(2);
    if (n == 1)
        msg.channel.send({ "embed": { "title": ":large_blue_diamond: **Heads**" } })
    else
        msg.channel.send({ "embed": { "title": ":large_orange_diamond: **Tails**" } })
    return Kwako.log.info({msg: 'flip', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'flip',
    aliases: ['coin', 'coinflip'],
    usage: "flip",
    desc: "Flip a coin",
    perms: ['EMBED_LINKS']
};