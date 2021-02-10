import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editMsgLogs(msg: Message, args: string[], guildConf: GuildConfig, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '💬 Set Message Logs channel',
        'description': 'Will log every events related to message editions & deletions',
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
            'title': '💬 Set Message Logs channel',
            'description': 'Tag the channel you want the Mod Logs to be sent in.'
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

    guildConf.msgLogChannel = value;

    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.msgLogChannel']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('💬').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}