/**
 * Elements related to the cooldowns system
 * @packageDocumentation
 * @module Cooldowns
 * @category Events
 */
import { MongoClient, Db } from 'mongodb';
import { Message } from 'discord.js';
import levelCheck from '../../utils/levelCheck';

let cooldownMsg: stringKeyArray = [], cooldownXP: stringKeyArray = [];
interface stringKeyArray {
    [index: string]: any;
}

/**
 * @classdesc Class used to gather every methods related to a cooldown system
 */
export default class cooldown {

    /**
     * Message cooldown handler (for anti-spam purpose)
     * Automatically mutes the spammer if a spam is detected
     * @param msg - Message object
     */
    static async message(msg: Message) {
        if (!cooldownMsg[msg.author.id]) {
            cooldownMsg[msg.author.id] = 1;
            setTimeout(async () => { delete cooldownMsg[msg.author.id] }, 2500)
        } else
            cooldownMsg[msg.author.id]++;

        if (cooldownMsg[msg.author.id] == 4)
            return msg.reply({ "embed": { "title": "**Please calm down, or I'll mute you.**", "color": 13632027 } })
        else if (cooldownMsg[msg.author.id] == 6) {
            await msg.member.roles.add('636254696880734238')
            let msgReply = await msg.reply({ "embed": { "title": "**You've been muted for 20 minutes. Reason : spamming.**", "color": 13632027 } })
            setTimeout(async () => {
                await msgReply.delete()
                return msg.member.roles.remove('636254696880734238')
            }, 1200000);
        }
    }

    /**
     * Experience cooldown (1exp earnable every 5sec)
     * @param msg - Message object
     * @param mongod - MongoDB Client
     * @param db - Database connection
     */
    static async exp(msg: Message, mongod: MongoClient, db: Db) {
        if (!cooldownXP[msg.author.id]) {
            let guild = `exp.${msg.guild.id.toString()}`
            await db.collection('user').updateOne({ _id: msg.author.id }, { $inc: { [guild]: 1 }  }, { upsert: true });
            let user = await db.collection('user').findOne({ '_id': { $eq: msg.author.id } });
            levelCheck(msg, (user.exp));
            cooldownXP[msg.author.id] = 1;
            return setTimeout(async () => { delete cooldownXP[msg.author.id] }, 5000)
        }

        mongod.close();
    }
}
