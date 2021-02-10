import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editMuteRole(msg: Message, args: string[], guildConf: GuildConfig, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '⛔ Set a Muted role',
        'description': "Please only set a Muted role if you have already one existing. If you don't have one, Kwako will automatically generate one when you'll mute someone.",
        'fields': [
            {
                "name": "✅",
                "value": "**Set a Role**",
                "inline": true
            },
            {
                "name": "❌",
                "value": "**Cancel**",
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
            'title': '⛔ Set a Muted Role',
            'description': 'Tag the role you want to be the Muted role.'
        }});

        let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
        await sentEdit.delete();

        if(!collected) return;
        await collected.first().delete().catch(() => {return})

        let role = collected.first().mentions.roles.first();
        if(!role) return;

        if(!role.editable) return (await msg.channel.send({'embed':{
            'title': ":x: The role you tagged is above mine in Roles hierarchy. I need to be above that role in order to mute people."
        }})).delete({ timeout: 10000 });

        value = role.id;
    }
    else if (emote.emoji.name === '❌') value = guildConf.muteRole;

    guildConf.muteRole = value;

    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.muteRole']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('⛔').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}