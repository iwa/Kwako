import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
import utilities from '../../utils/utilities'

module.exports.run = (msg: Message, args: string[]) => {
    if (args.length < 1) return;
    let req = args[0].toLowerCase(), numReq, res;

    switch (req) {
        case "rock":
            numReq = 1;
            break;

        case "paper":
            numReq = 2;
            break;

        case "scissors":
        case "scissor":
            numReq = 3;
            break;

        default:
            return msg.channel.send({ "embed": { "title": ":x: > **You need to pick between rock, paper or scissors !**" } })
    }

    let n = utilities.randomInt(3);

    if (n == 1 && numReq == 1 || n == 2 && numReq == 2 || n == 3 && numReq == 3)
        res = "**Draw!**";
    if (n == 1 && numReq == 2 || n == 2 && numReq == 3 || n == 3 && numReq == 1)
        res = "**You won!**";
    if (n == 1 && numReq == 3 || n == 2 && numReq == 1 || n == 3 && numReq == 2)
        res = "**I won!**";

    const embed = new MessageEmbed();

    if (n == 1)
        embed.setTitle(":punch: **I play rock!**");
    if (n == 2)
        embed.setTitle(":hand_splayed: **I play paper!**");
    if (n == 3)
        embed.setTitle(":v: **I play scissors!**");

    embed.setDescription(res);

    Kwako.log.info({msg: 'rps', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    return msg.channel.send(embed).catch(err => Kwako.log.error(err))
};

module.exports.help = {
    name: 'rps',
    usage: "rps (rock | paper | scissors)",
    desc: "Play Rock-Paper-Scissors with me",
    perms: ['EMBED_LINKS']
};