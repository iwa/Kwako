import Kwako from '../../Client';
import { Message } from "discord.js";
import GuildConfig from '../../interfaces/GuildConfig';

import chooseWhat from './chooseWhat';
import updateSent from './updateSent';

export default async function editPrefix(msg: Message, args: string[], guildConf: GuildConfig, sent: Message): Promise<any> {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '❕ Change the prefix',
        'description': 'Send in the channel the new prefix.\n3 characters max.',
        'footer': {
            'text': 'Type "cancel" to cancel the edit.'
        }
    }});

    let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
    if(!collected) return;

    let prefix = collected.first().cleanContent.toLowerCase();

    sentEdit.delete();
    collected.first().delete();

    if(prefix.includes('cancel')) {
        await sent.reactions.resolve('❕').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(prefix.length > 3) {
        await (await msg.channel.send('superior of 3 characters!!!')).delete({ timeout: 6000 });
        return editPrefix(msg, args, guildConf, sent);
    }

    guildConf.prefix = prefix;
    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.prefix']: prefix } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('❕').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}