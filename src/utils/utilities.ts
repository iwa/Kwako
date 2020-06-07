/**
 * Group of utilities functions
 * @packageDocumentation
 * @module Utilities
 * @category Utils
 */
import * as Discord from "discord.js";
import { Db } from 'mongodb';

/** @desc Object containing infos about levels (ids, exp amounts, ...) */
let levels = require('../../lib/levels.json')
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
                "description": "Kwako is developed and handled by <@125325519054045184>.\nYou can help contribute to Q-Bot's code [here!](https://github.com/iwa/Q-Bot)\n\nLanguage : `TypeScript` using NodeJS\nAPI Access : `discord.js` package on npm\n\nYou can access to the index of commands by typing `?help`\n\nAll my work is done for free, but you can still financially support me [here](https://www.patreon.com/iwaQwQ)",
                "color": 13002714,
                "footer": {
                    "text": `Created with ♥ by iwa & contributors | Copyright © iwa, v${packageJson.version}`
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
        if (xp < levels[1].amount) {
            return { 'level': 0, 'current': xp, 'max': levels[1].amount }
        }
        for (let i = 1; i < 20; i++) {
            if (xp >= levels[i].amount && xp < levels[i + 1].amount) {
                return { 'level': i, 'current': (xp - levels[i].amount), 'max': (levels[i + 1].amount - levels[i].amount) }
            }
        }
        return { 'level': 20, 'current': xp, 'max': levels[20].amount }
    }
}