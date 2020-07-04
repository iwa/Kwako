/**
 * Function that runs every time someone leaves the server
 * @packageDocumentation
 * @module MemberLeave
 * @category Events
 */
import { Db } from 'mongodb';
import { GuildMember, PartialGuildMember } from 'discord.js';
/**
 * @desc MongoDB constants
 */
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

/**
 * Called by the 'guildMemberRemove' event
 * Hids the user in the database (hidden from leaderboards, ...)
 * @param {GuildMember | PartialGuildMember} member - Guild Member object
 */
export default async function memberLeave(member: GuildMember | PartialGuildMember, db: Db) {
    let user = await db.collection('user').findOne({ '_id': { $eq: member.id } });
    if (user)
        await db.collection('user').updateOne({ _id: member.id }, { $set: { hidden: true } });
}