import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editExpSystem(msg: Message, args: string[], guildConf: GuildConfig, sent: Message, sentEdit: Message | null): Promise<any> {
    if(!sentEdit) {
        sentEdit = await msg.channel.send({'embed':{
            'title': '<a:ExperienceOrb:735085209573261332> Edit the Levels System',
            'fields': [
                {
                    "name": ":one: Enable Levels System",
                    "value": guildConf.useExpSystem ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":two: Show Level Ups",
                    "value": guildConf.showLevelUp ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":door: Return",
                    "value": "Return to main edit screen",
                    "inline": true
                }
            ]
        }});
        sentEdit.react('1️⃣'); sentEdit.react('2️⃣'); sentEdit.react('🚪');
    } else
        await sentEdit.edit({'embed':{
            'title': '<a:ExperienceOrb:735085209573261332> Edit the Levels System',
            'fields': [
                {
                    "name": ":one: Enable Levels System",
                    "value": guildConf.useExpSystem ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":two: Show Level Ups",
                    "value": guildConf.showLevelUp ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":door: Return",
                    "value": "Return to main edit screen",
                    "inline": true
                }
            ]
        }});

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['1️⃣', '2️⃣', '🚪'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return;

    let emote = collected.first();

    if(emote.emoji.name === '🚪') {
        sentEdit.delete();
        sent = await updateSent(guildConf, sent);
        await sent.reactions.resolve('735085209573261332').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(emote.emoji.name === '1️⃣') {
        await sentEdit.reactions.resolve('1️⃣').users.remove(msg.author.id);

        if(guildConf.useExpSystem === true)
            guildConf.useExpSystem = false;
        else
            guildConf.useExpSystem = true;

        await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.useExpSystem']: guildConf.useExpSystem } });
    }

    if(emote.emoji.name === '2️⃣') {
        await sentEdit.reactions.resolve('2️⃣').users.remove(msg.author.id);

        if(guildConf.useExpSystem === false)
            await (await msg.channel.send({'embed':{
                'title': ':x: Impossible, you need to have the Levels System enabled to edit this parameter'
            }})).delete({ timeout: 6000 });
        else {
            if(guildConf.showLevelUp === true)
                guildConf.showLevelUp = false;
            else
                guildConf.showLevelUp = true;

            console.log(guildConf.showLevelUp)

            await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.showLevelUp']: guildConf.showLevelUp } });
        }
    }

    return editExpSystem(msg, args, guildConf, sent, sentEdit);
}