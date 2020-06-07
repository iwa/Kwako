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
    await bot.user.setActivity("Qumu's Remixes | ?help", { type: 2 }).catch(console.error);
    await bot.user.setStatus("online").catch(console.error)

    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);

    let allMsg = db.collection('msg').find()
    allMsg.forEach(async elem => {
        let channel: any = await bot.channels.fetch(elem.channel)
        await channel.messages.fetch(elem._id, true)
    });

    return setTimeout(async () => {
        await mongod.close()
    }, 15000);
}