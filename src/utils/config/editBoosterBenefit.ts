import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editBoosterBenefit(msg: Message, args: string[], guildConf: GuildConfig, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '🟣 Set Booster benefits',
        'description': 'Do you want to offer to your Nitro Boosters a 1.25x experience points multiplier perk, as a thanks for their support?\n\n*Note: also applies to the server staff, as a thanks for their work.*',
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

    let value = false;
    if(emote.emoji.name === '✅') value = true;
    else if (emote.emoji.name === '❌') value = false;

    guildConf.boosterBenefits = value;

    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.boosterBenefits']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('🟣').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}