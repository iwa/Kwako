import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editWelcomeMessage(msg: Message, args: string[], guildConf: GuildConfig, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '✉️ Change the DM Welcome Message',
        'description': 'Send in the channel the new welcome message.',
        'footer': {
            'text': 'Type "cancel" to cancel the edit. Type "off" to disable.'
        }
    }});

    let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
    if(!collected) return;

    let reply = collected.first().cleanContent;

    sentEdit.delete();
    collected.first().delete();

    if(reply.toLowerCase().startsWith('cancel')) {
        await sent.reactions.resolve('✉️').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(reply.toLowerCase().startsWith('off'))
        reply = '';

    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.welcomeMessage']: reply } });

    guildConf.welcomeMessage = reply;

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('✉️').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}