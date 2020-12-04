/**
 * 'Ready' function executed every times the bot logs in
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */
import Kwako from '../Client';
import { TextChannel } from 'discord.js';

let { version } = require('../../package.json');

/**
 * - Sets bot activity
 * - Cache all messages needed for Reaction Roles system
 */
export default async function ready() {
    await Kwako.user.setActivity(`kwako.iwa.sh ☁️ v${version}`, { type: 'WATCHING' }).catch(err => Kwako.log.error(err));
    await Kwako.user.setStatus("online").catch(err => Kwako.log.error(err))

    let allMsg = Kwako.db.collection('msg').find()
    if(allMsg) {
        allMsg.forEach(async elem => {
            let channel = await Kwako.channels.fetch(elem.channel).catch(() => {return});
            if(channel && channel.type === 'text') {
                let msg = await (channel as TextChannel).messages.fetch(elem._id, true).catch(() => {return});
                if(!msg)
                    await Kwako.db.collection('msg').deleteOne({ _id: elem._id });
            } else
                await Kwako.db.collection('msg').deleteOne({ _id: elem._id });
        });
    }
}