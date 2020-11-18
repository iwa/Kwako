/**
 * Functions related to leveling up
 * @packageDocumentation
 * @module Leveling
 * @category Utils
 */
import Kwako from '../Client';
import Discord from "discord.js";
import utilities from './utilities';

export default async function levelCheck (msg: Discord.Message, xp: number, exp: number, showLevelUp: boolean) {
    let before = utilities.levelInfo(xp);
    let after = utilities.levelInfo((xp + exp));
    if(before.level !== after.level) {
        showLevelUp &&= true;
        if ((after.level % 5) === 0 && showLevelUp)
            await msg.reply(`you're now level ${after.level}!🎉🎉`).catch(() => {return});

        let guildConf = await Kwako.db.collection('guilds').findOne({ '_id': { $eq: msg.guild.id } });
        let levelroles:string = guildConf.levelroles || "[]";
        let levelrolesMap:Map<number, Array<string>> = new Map(JSON.parse(levelroles));

        let roles = levelrolesMap.get(after.level);

        if (roles && roles[0]) {
            await msg.member.roles.add(roles[0]).catch(() => {return});
            if (roles[1])
                await msg.member.roles.remove(roles[1]).catch(() => {return});
        }
    }
}