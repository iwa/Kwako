/**
 * 'Ready' function executed every times the bot logs in
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */
import { Client, TextChannel } from 'discord.js';
import { Db } from 'mongodb';

let { version } = require('../../package.json');

/**
 * - Sets bot activity
 * - Cache all messages needed for Reaction Roles system
 * @param {Client} bot - Discord Client object
 */
export default async function ready(bot: Client, db: Db) {
    await bot.user.setActivity(`kwako.iwa.sh | v${version}`, { type: 'WATCHING' }).catch(console.error);
    await bot.user.setStatus("online").catch(console.error)

    let allMsg = db.collection('msg').find()
    if(allMsg) {
        allMsg.forEach(async elem => {
            let channel = await bot.channels.fetch(elem.channel).catch(() => {return});
            if(channel && channel.type === 'text') {
                let msg = await (channel as TextChannel).messages.fetch(elem._id, true).catch(() => {return});
                if(!msg)
                    await db.collection('msg').deleteOne({ _id: elem._id });
            } else
                await db.collection('msg').deleteOne({ _id: elem._id });
        });
    }
}