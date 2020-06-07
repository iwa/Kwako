import { Client, Message, MessageEmbed } from 'discord.js'

let reply = ["Yes", "No", "Yep", "Nope", "Probably", "Well...", "Probably not", "Reply hazy, try again", "Take a guess", "Nah.", "🎱"] // I like that last one. :)

module.exports.run = async (bot: Client, msg: Message, args: string[]) => {
    if (msg.channel.type != "text") return;
    if (args.length < 1) return;
    let r = Math.floor((Math.random() * reply.length));
    const embed = new MessageEmbed();
    embed.setTitle(`🎱 ${reply[r]}`)
    embed.setColor('GREY')
    console.log(`info: 8ball by ${msg.author.tag}`)
    return msg.channel.send(embed)
};

module.exports.help = {
    name: '8ball',
    usage: "8ball (your question)",
    desc: "Let Kwako reply to all your questions, with a **lot** of honesty"
};