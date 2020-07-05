import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, commands:any, settings:Map<string, Object>) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA || process.env.SUDO == '0')) return;
    if (args.length != 1) return;
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    if(!guildConf) {
        await db.collection('settings').insertOne({ '_id': msg.guild.id });
        guildConf = { '_id': msg.guild.id };
    }
    let levelroles:string = guildConf.levelroles ? guildConf.levelroles : "[]";
    let levelrolesMap:Map<number, string> = new Map(JSON.parse(levelroles));

    if(parseInt(args[0]) < 2 || parseInt(args[0]) > 100)
        return msg.channel.send(":x: > Please choose a valid level number between 2 and 100!")

    levelrolesMap.delete(parseInt(args[0]))

    levelroles = JSON.stringify([...levelrolesMap]);

    await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

    return msg.channel.send(`I'll no longer give a role when members achieve the level **${args[0]}**.`);
};

module.exports.help = {
    name: 'dellevelrole',
    usage: "dellevelrole (level number)",
    staff: true
};