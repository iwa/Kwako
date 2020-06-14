/**
 * Functions related to leveling up
 * @packageDocumentation
 * @module Leveling
 * @category Utils
 */
import * as Discord from "discord.js";
import utilities from './utilities';

export default async function levelCheck (msg: Discord.Message, xp: number) {
    let lvl = utilities.levelInfo(xp);
    if(lvl.current === 0) {
        try {
            await msg.reply(`you're now level ${lvl.level}!🎉🎉`)
        } catch (err) {
            console.error(err)
        }
    }
}
