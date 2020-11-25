import Kwako from '../../Client'
import { Message } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if (args.length === 1) {
        if (msg.mentions.everyone) return;
        let mention = msg.mentions.users.first()
        if (!mention) return;
        if (mention.bot) return;

        let married: string = null;
        let user = await Kwako.db.collection('user').findOne({ _id: msg.author.id });
        if(user)
            if(user.marriage)
                if(user.marriage[msg.guild.id])
                    married = user.marriage[msg.guild.id]

        if(married) return msg.channel.send({'embed':{
            'title': ":x: You're already married to someone!",
            'description': `If you wanna divorce, type \`${guildConf.prefix}divorce\``
        }});

        let targetMarried: string = null;
        let target = await Kwako.db.collection('user').findOne({ _id: mention.id });
        if(target)
            if(target.marriage)
                if(target.marriage[msg.guild.id])
                    targetMarried = target.marriage[msg.guild.id]

        if(targetMarried) return msg.channel.send({'embed':{
            'title': ":x: The person you want to propose to is already married"
        }});

        let sent = await msg.channel.send(`<@${mention.id}>`, {'embed':{
            "title": `:ring: ${msg.author.username} has proposed to you, ${mention.username}!`,
            "color": 11847648,
            "fields": [
                {
                  "name": "✅",
                  "value": "**Accept**",
                  "inline": true
                },
                {
                  "name": "❌",
                  "value": "**Decline**",
                  "inline": true
                },
            ],
            "footer": {
                "text": "The request will be cancelled in 24h if no response is given"
            }
        }});

        sent.react('✅'); sent.react('❌');

        let collected = await sent.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === mention.id), { max: 1, time: 86400000 });
        if(!collected) return;

        let emote = collected.first();

        if(emote.emoji.name === '✅') {
            await msg.channel.send({'embed':{
                "title": `:heartpulse: ${msg.author.username} and ${mention.username} are now married!`,
                "color": 12265015
            }});
            let guild = `marriage.${msg.guild.id}`
            await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, { $set: { [guild]: mention.id } });
            await Kwako.db.collection('user').updateOne({ _id: mention.id }, { $set: { [guild]: msg.author.id } });
        }

        if(emote.emoji.name === '❌') {
            await msg.channel.send(`<@${msg.author.id}>`, {'embed':{
                "title": `😥 ${mention.username} turned down your proposal...`
            }});
        }
    } else {
        return (await msg.channel.send({
            'embed': {
                'title': "You have to mention someone!",
                'description': `\`${guildConf.prefix}marry @user\``
            }
        })).delete({ timeout: 6000 });
    }
};

module.exports.help = {
    name: 'marry',
    usage: "marry @user",
    desc: "Proposes to someone",
    premium: true
};