import Kwako from '../../Client'
import { Message } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    let married: string = null;
    let user = await Kwako.db.collection('user').findOne({ _id: msg.author.id });
    if(user)
        if(user.marriage)
            if(user.marriage[msg.guild.id])
                married = user.marriage[msg.guild.id]

    if(married) {
        let sent = await msg.channel.send({'embed':{
            "title": "❓ Are you sure?",
            "description": `You're currently married to <@${married}>\nAre you sure you wanna leave your current partner?`,
            "color": 10372944,
            "fields": [
                {
                  "name": "✅",
                  "value": "**I'm sure**",
                  "inline": true
                },
                {
                  "name": "❌",
                  "value": "**Actually no**",
                  "inline": true
                },
            ]
        }});

        sent.react('✅'); sent.react('❌');

        let collected = await sent.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 86400000 });
        if(!collected) return;

        let emote = collected.first();

        if(emote.emoji.name === '✅') {
            await sent.delete().catch(() => {return});
            let target = await Kwako.users.fetch(married);
            await msg.channel.send({'embed':{
                "title": `:broken_heart: ${msg.author.username} has divorced ${target.username}`,
                "color": 6370105
            }});
            let guild = `marriage.${msg.guild.id}`
            await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, { $unset: { [guild]: "" } });
            await Kwako.db.collection('user').updateOne({ _id: target.id }, { $unset: { [guild]: "" } });
        }

        if(emote.emoji.name === '❌') {
            await sent.delete().catch(() => {return});
        }
    } else {
        return msg.channel.send({'embed':{
            'title': ":x: You can't divorce if you're not engaged"
        }})
    }
};

module.exports.help = {
    name: 'divorce',
    usage: "divorce",
    desc: "Divorce",
    premium: true
};