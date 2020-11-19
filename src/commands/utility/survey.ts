import { Message } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if (args.length < 1) return;
    let req = args.join(' ');

    await msg.delete();
    let sent = await msg.channel.send({'embed':{
        'title': ':newspaper: Survey',
        'description': req,
        "timestamp": Date.now(),
        "footer": {
            "text": `by ${msg.author.username}`
        }
    }})

    sent.react('✅'); sent.react('❌');
};

module.exports.help = {
    name: 'survey',
    usage: "survey (question)",
    desc: "Send a survey in the channel you're in",
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES']
};