/**
 * Group of utilities functions
 * @packageDocumentation
 * @module Utilities
 * @category Utils
 */
import * as Discord from "discord.js";

/** @desc Importing package.json to fetch the version tag */
let packageJson = require('../../package.json')

export default class utilities {

    /**
     * Sends a little message containing useful infos about the bot
     * @param msg - Message object
     * @param iwaUrl - iwa's Discord pfp url (fetched before the exec of the method)
     */
    public static async info(msg: Discord.Message, iwaUrl: string): Promise<Discord.Message> {
        let embed = {
            "embed": {
                "title": "**Bot Infos**",
                "description": "Kwako is developed and handled by <@125325519054045184>.\n\nLanguage : `TypeScript` using NodeJS\nAPI Access : `discord.js` package\n\nYou can access to the index of commands by typing `?help`\n\nAll my work is done for free, but you can still financially support me [here](https://www.patreon.com/iwaQwQ)",
                "color": 13002714,
                "footer": {
                    "text": `Created with ♥ by iwa | Copyright © iwa, v${packageJson.version}`
                },
                "thumbnail": {
                    "url": iwaUrl
                }
            }
        }

        try {
            console.log(`info: info: ${msg.author.tag}`)
            await msg.author.send(embed)
        } catch (ex) {
            return msg.channel.send("**:x: > Please open your DMs!**")
        }

    }

    /**
     * Generates a random number between 1 and 'max'
     * @param max - Maximum value
     */
    static randomInt(max: number): number {
        return Math.floor(Math.random() * Math.floor(max) + 1);
    }

    /**
     * Creates an object containing infos about user's level
     * @param xp - Total amount of exp points of the user
     */
    static levelInfo(xp: number): { 'level': number, 'current': number, 'max': number } {
        let x = 25;
        for (let i = 1; i < 50; i++) {
            if (xp < x) {
                return { 'level': i, 'current': xp, 'max': x }
            }
            xp -= x;
            x = Math.round(Math.log(Math.pow(x, 2))+(x*1.375))
        }
        return { 'level': 50, 'current': 1, 'max': 1 }
    }

    static expForLevel(level: number): number {
        let x = 25;
        let xp = 0;
        for (let i = 1; i <= level; i++) {
            xp += x;
            x = Math.round(Math.log(Math.pow(x, 2))+(x*1.375))
        }
        return xp;
    }
}