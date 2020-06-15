/**
 * 'Ready' function executed every times the bot logs in
 * @packageDocumentation
 * @module ReadyFunction
 * @category Events
 */
import { Client } from 'discord.js';
import { MongoClient } from 'mongodb';
/**
 * @desc MongoDB constants
 */
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

/**
 * - Sets bot activity
 * - Cache all messages needed for Reaction Roles system
 * @param {Client} bot - Discord Client object
 */
export default async function ready(bot: Client) {
    let guilds = await bot.shard.fetchClientValues('guilds.cache.size')
    await bot.user.setActivity(`with ${guilds.reduce((prev, guildCount) => prev + guildCount, 0)} guilds`, { type: 0 }).catch(console.error);
    await bot.user.setStatus("online").catch(console.error)

    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);

    let allMsg = db.collection('msg').find()
    if(allMsg) {
        allMsg.forEach(async elem => {
            let channel: any = await bot.channels.fetch(elem.channel)
            if(channel)
                await channel.messages.fetch(elem._id, true)
        });
    }

    return setTimeout(async () => {
        await mongod.close()
    }, 15000);
}