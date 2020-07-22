/**
 * Reaction roles methods to run RR Messages
 * @packageDocumentation
 * @module ReactionRoles
 * @category Events
 */
import { MessageReaction, User } from "discord.js";
import { Db } from 'mongodb';

/**
 * @class reactionRoles class
 */
export default class reactionRoles {

    /**
     * Gives the corresponding role of the reaction to the user
     * @param {MessageReaction} reaction
     * @param {User} author
     */
    static async add(reaction: MessageReaction, author: User, db: Db) {
        let msg = await db.collection('msg').findOne({ _id: reaction.message.id })
        if (!msg) return;

        let role = msg.roles.find((val: any) => val.emote == reaction.emoji.name)
        if (!role) return;

        let member = reaction.message.guild.member(author)
        if (!member) return;
        await member.roles.add(role.id)
    }

    /**
     * Removes the corresponding role of the reaction from the user
     * @param {MessageReaction} reaction
     * @param {User} author
     */
    static async remove(reaction: MessageReaction, author: User, db: Db) {
        let msg = await db.collection('msg').findOne({ _id: reaction.message.id })
        if (!msg) return;

        let role = msg.roles.find((val: any) => val.emote == reaction.emoji.name)
        if (!role) return;

        let member = reaction.message.guild.member(author)
        if (!member) return;
        await member.roles.remove(role.id)
    }
}