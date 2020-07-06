import { Client, Message } from 'discord.js'
import utilities from '../../utils/utilities'

module.exports.run = (bot: Client, msg: Message) => {
    let n = utilities.randomInt(2);
    if (n == 1)
        msg.channel.send({ "embed": { "title": ":large_blue_diamond: **Heads**" } })
    else
        msg.channel.send({ "embed": { "title": ":large_orange_diamond: **Tails**" } })
    return console.log(`info: flip coin by ${msg.author.tag}`)
};

module.exports.help = {
    name: 'flip',
    usage: "flip",
    desc: "Flip a coin",
    perms: ['EMBED_LINKS']
};