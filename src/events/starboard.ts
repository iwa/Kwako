/**
 * Starboard class containing methods needed to run a Starboard channel
 * @packageDocumentation
 * @module Starboard
 * @category Events
 */
import Kwako from '../Client'
import { Message, MessageReaction, User } from "discord.js";

export default class starboard {

    /**
     * Sends the message to the Starboard channel
     * @param {Client} bot - Discord Client object
     * @param {Message} msg - Message object
     * @param {MessageReaction} reaction - Reaction object
     * @param {string} content - Content of the message that'll be posted to the Starboard
     */
    static async send(msg: Message, reaction: MessageReaction, content: string, starboardChannel: string): Promise<void> {
        let channel: any = Kwako.channels.fetch(starboardChannel);
        if (!channel) return;
        await msg.react(reaction.emoji.name);
        await channel.send({
            "embed": {
                "description": `${content}[message link✉️](${msg.url})`,
                "color": 14212956,
                "timestamp": msg.createdTimestamp,
                "footer": {
                    "text": "New starboard entry ⭐️"
                },
                "author": {
                    "name": msg.author.username,
                    "icon_url": msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 })
                }
            }
        });
        Kwako.log.info(`info: new message into starboard (author: ${msg.author.tag})`);
    }

    /**
     * Checks every message reacted with a star emoji
     * @param {MessageReaction} reaction - Reaction object
     * @param {User} author - Author Object
     * @param {Client} bot - Discord Client object
     */
    static async check(reaction: MessageReaction, author: User, starboardChannel: string) {
        if (reaction.message.guild.id !== process.env.GUILDID) return;
        if (reaction.message.channel.id == process.env.STARBOARDTC) return;
        if (reaction.message.channel.id == process.env.ANNOUNCEMENTSTC) return;
        if (reaction.users.cache.find(val => val.id === Kwako.user.id)) return;
        if (reaction.emoji.name == '⭐') {
            if (reaction.count >= 5) {
                let msg = reaction.message;
                let content;
                if (!msg.cleanContent)
                    content = "*attachment only*\n"
                else
                    content = `\`\`\`${msg.cleanContent}\`\`\``

                return starboard.send(msg, reaction, content, starboardChannel);
            }
        } else if (reaction.emoji.name == '🌟' && author.id == process.env.IWA) {
            let msg = reaction.message;
            let content;
            if (!msg.cleanContent)
                content = "*attachment only*\n"
            else
                content = `\`\`\`${msg.cleanContent}\`\`\``

            return starboard.send(msg, reaction, content, starboardChannel);
        }
    }
}