import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if (args.length === 1) {
        if (msg.mentions.everyone) return;
        let mention = msg.mentions.users.first()
        if (!mention) return;

        let avatar = mention.avatarURL({ dynamic: true }) || mention.defaultAvatarURL

        await msg.channel.send({"embed":{
            "title": `${mention.username}'s Avatar`,
            "image": {
                "url": avatar
            },
            "footer": {
                "text": `${mention.id}`
            },
        }});

        Kwako.log.info({msg: 'pfp', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.tag }});
    } else {

        let avatar = msg.author.avatarURL({ dynamic: true }) || msg.author.defaultAvatarURL

        await msg.channel.send({"embed":{
            "title": `${msg.author.username}'s Avatar`,
            "image": {
                "url": avatar
            },
            "footer": {
                "text": `${msg.author.id}`
            },
        }});

        Kwako.log.info({msg: 'pfp', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: msg.author.id, name: msg.author.tag }});
    }
};

module.exports.help = {
    name: 'pfp',
    aliases: ['profilepic', 'avatar'],
    usage: "pfp (mention someone)",
    desc: "Print your or someone's pfp in the channel you sent the command.",
    premium: true
};