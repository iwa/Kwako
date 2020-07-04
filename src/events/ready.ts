/**
 * 'Ready' function executed every times the bot logs in
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */
import { Client } from 'discord.js';
import { Db } from 'mongodb';
/**
 * @desc MongoDB constants
 */
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

/**
 * - Sets bot activity
 * - Cache all messages needed for Reaction Roles system
 * @param {Client} bot - Discord Client object
 */
export default async function ready(bot: Client, db: Db) {
    await bot.user.setActivity(`kwako.iwa.sh`, { type: 'WATCHING' }).catch(console.error);
    await bot.user.setStatus("online").catch(console.error)

    let allMsg = db.collection('msg').find()
    if(allMsg) {
        allMsg.forEach(async elem => {
            let channel: any = await bot.channels.fetch(elem.channel)
            if(channel)
                await channel.messages.fetch(elem._id, true)
        });
    }
}