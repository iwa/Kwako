import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editStarboard(msg: Message, args: string[], guildConf: GuildConfig, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '⭐ Edit the Starboard',
        'fields': [
            {
                "name": ":one: Starboard Channel",
                "value": guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled',
                "inline": true
            },
            {
                "name": ":two: Starboard Emote",
                "value": guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:',
                "inline": true
            },
            {
                "name": ":three: Starboard Amount",
                "value": guildConf.starReactions || '5',
                "inline": true
            },
            {
                "name": ":door: Return",
                "value": "Return to main edit screen",
                "inline": true
            }
        ]
    }});

    sentEdit.react('1️⃣'); sentEdit.react('2️⃣'); sentEdit.react('3️⃣'); sentEdit.react('🚪');

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['1️⃣', '2️⃣', '3️⃣', '🚪'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) {
        sent = await updateSent(guildConf, sent);
        await sent.reactions.resolve('⭐').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    let emote = collected.first();

    if(emote.emoji.name === '🚪') {
        sent = await updateSent(guildConf, sent);
        await sent.reactions.resolve('⭐').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(emote.emoji.name === '1️⃣') {
        let sentEdit = await msg.channel.send({'embed':{
            'title': '⭐ Set Starboard Channel',
            'fields': [
                {
                    "name": "✅",
                    "value": "**Enable**",
                    "inline": true
                },
                {
                    "name": "❌",
                    "value": "**Disable**",
                    "inline": true
                }
            ]
        }});

        sentEdit.react('✅'); sentEdit.react('❌');

        let collected = await sentEdit.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
        if(!collected) return sentEdit.delete();

        let emote = collected.first();

        sentEdit.delete();

        let value = '';
        if(emote.emoji.name === '✅') {
            let sentEdit = await msg.channel.send({'embed':{
                'title': '⭐ Set Starboard Channel',
                'description': 'Tag the channel you want the Starboard to be.'
            }});

            let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
            await sentEdit.delete();

            if(!collected) return;
            await collected.first().delete().catch(() => {return})

            let channel = collected.first().mentions.channels.first();
            if(!channel) return;

            if(!channel.viewable) return (await msg.channel.send({'embed':{
                'title': ":x: I can't access to the channel! Make sure I can read and send message in this channel."
            }})).delete({ timeout: 10000 });

            value = channel.id;
        }
        else if (emote.emoji.name === '❌') value = '';

        guildConf.starboardChannel = value;

        await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.starboardChannel']: value } });
    }

    if(emote.emoji.name === '2️⃣') {
        let sentEdit = await msg.channel.send({'embed':{
            'title': '⭐ Set Starboard Emote',
            'description': 'Send the Starboard Emote in the channel to edit it.',
            'footer': {
                'text': 'Type "cancel" to cancel the edit.'
            }
        }});

        let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
        if(!collected) return;

        let emote = collected.first().cleanContent.toLowerCase();

        sentEdit.delete();
        collected.first().delete();

        if(emote.includes('cancel')) {
            await sent.reactions.resolve('❕').users.remove(msg.author.id);
            return chooseWhat(msg, args, guildConf, sent);
        }

        // TODO: add a security to avoid multiple emotes

        guildConf.customEmote = emote;

        await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.customEmote']: emote } });
    }

    if(emote.emoji.name === '3️⃣') {
        let sentEdit = await msg.channel.send({'embed':{
            'title': '⭐ Set Starboard Reactions amount',
            'description': 'Send in the channel the amount of reactions needed.',
            'footer': {
                'text': 'Type "cancel" to cancel the edit.'
            }
        }});

        let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
        if(!collected) return;

        let num = collected.first().cleanContent.toLowerCase();

        sentEdit.delete();
        collected.first().delete();

        if(num.includes('cancel')) {
            await sent.reactions.resolve('❕').users.remove(msg.author.id);
            return chooseWhat(msg, args, guildConf, sent);
        }

        if(num.length > 2) return;

        let amount = parseInt(num, 10)
        if(!amount) return;

        guildConf.starReactions = amount;

        await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.starReactions']: amount } });
    }

    sentEdit.delete();
    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('⭐').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}