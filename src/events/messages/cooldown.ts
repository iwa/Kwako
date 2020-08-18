/**
 * Elements related to the cooldowns system
 * @packageDocumentation
 * @module Cooldowns
 * @category Events
 */
import Kwako from '../../Client'
import { Message } from 'discord.js';

import levelCheck from '../../utils/levelCheck';
import utils from '../../utils/utilities';
let exp: number = 2;

let cooldownMsg: Map<string, number> = new Map();
let cooldownXP = new Set();

/**
 * @classdesc Class used to gather every methods related to a cooldown system
 */
export default class cooldown {

    /**
     * Message cooldown handler (for anti-spam purpose)
     * Automatically mutes the spammer if a spam is detected
     * @param msg - Message object
     */
    static async message(msg: Message, guildConf: any) {
        if(guildConf.muteRole != "") {
            if (!cooldownMsg.has(msg.author.id)) {
                cooldownMsg.set(msg.author.id, 1);
                setTimeout(async () => { cooldownMsg.delete(msg.author.id) }, 2500)
            } else
                cooldownMsg.set(msg.author.id, (cooldownMsg.get(msg.author.id)+1));

            if (cooldownMsg.get(msg.author.id) == 4)
                return msg.reply({ "embed": { "title": "**Please calm down, or I'll mute you.**", "color": 13632027 } })
            else if (cooldownMsg.get(msg.author.id) == 6) {
                await msg.member.roles.add(guildConf.muteRole)
                let msgReply = await msg.reply({ "embed": { "title": "**You've been muted for 20 minutes. Reason: spamming.**", "color": 13632027 } })
                setTimeout(async () => {
                    await msgReply.delete()
                    return msg.member.roles.remove(guildConf.muteRole)
                }, 1200000);
            }
        }
    }

    /**
     * Experience cooldown
     * @param msg - Message object
     * @param mongod - MongoDB Client
     * @param db - Database connection
     */
    static async exp(msg: Message) {
        if (!cooldownXP.has(msg.author.id)) {
            let guild = `exp.${msg.guild.id.toString()}`
            let user = await Kwako.db.collection('user').findOne({ '_id': { $eq: msg.author.id } });

            let amount = exp;
            if(msg.member.premiumSinceTimestamp != null || msg.member.hasPermission('MANAGE_GUILD'))
                amount = Math.floor(amount * 1.5);

            if(user && user.exp)
                if(user.exp[msg.guild.id])
                    levelCheck(msg, (user.exp[msg.guild.id]), amount);

            await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, { $inc: { [guild]: amount }  }, { upsert: true });
            cooldownXP.add(msg.author.id);
            return setTimeout(async () => { cooldownXP.delete(msg.author.id) }, 5000)
        }
    }
}

setInterval(() => { exp = utils.randomInt(5) + 2 }, 300000);
