/**
 * Functions related to leveling up
 * @packageDocumentation
 * @module Leveling
 * @category Utils
 */
import * as Discord from "discord.js";
import utilities from './utilities';
import { Db } from "mongodb";

export default async function levelCheck (msg: Discord.Message, xp: number, db: Db, exp: number) {
    let before = utilities.levelInfo(xp);
    let after = utilities.levelInfo((xp + exp))
    if(before.level != after.level) {
        await msg.reply(`you're now level ${after.level}!🎉🎉`).catch(() => {return})
        let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
        let levelroles:string = guildConf.levelroles || "[]";
        let levelrolesMap:Map<number, string> = new Map(JSON.parse(levelroles));

        if(levelrolesMap.has(after.level))
            await msg.member.roles.add(levelrolesMap.get(after.level)).catch(() => {return});
    }
}
