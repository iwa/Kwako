/**
 * Functions related to leveling up
 * @packageDocumentation
 * @module Leveling
 * @category Utils
 */
import * as Discord from "discord.js";
import utilities from './utilities';
import { Db } from "mongodb";

export default async function levelCheck (msg: Discord.Message, xp: number, db:Db) {
    let lvl = utilities.levelInfo(xp);
    if(lvl.current === 0) {
        await msg.reply(`you're now level ${lvl.level}!🎉🎉`).catch(() => {return})
        let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
        let levelroles:string = guildConf.levelroles ? guildConf.levelroles : "[]";
        let levelrolesMap:Map<number, string> = new Map(JSON.parse(levelroles));

        if(levelrolesMap.has(lvl.level))
            await msg.member.roles.add(levelrolesMap.get(lvl.level)).catch(() => {return});
    }
}
