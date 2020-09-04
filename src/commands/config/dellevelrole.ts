import Kwako from '../../Client';
import { Message } from 'discord.js';

module.exports.run = async (msg: Message, args: string[]) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 1) return;
    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    if(!guildConf) {
        await Kwako.db.collection('settings').insertOne({ '_id': msg.guild.id });
        guildConf = { '_id': msg.guild.id };
    }

    guildConf.useExpSystem &&= true;
    if(!guildConf.useExpSystem)
        return msg.channel.send(':x: > You need to enable the experience system in order to use level roles');

    let levelroles:string = guildConf.levelroles ? guildConf.levelroles : "[]";
    let levelrolesMap:Map<number, string> = new Map(JSON.parse(levelroles));

    if(parseInt(args[0], 10) < 2 || parseInt(args[0], 10) > 50)
        return msg.channel.send(":x: > Please choose a valid level number between 2 and 50!")

    levelrolesMap.delete(parseInt(args[0], 10))

    levelroles = JSON.stringify([...levelrolesMap]);

    await Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

    await msg.channel.send(`I'll no longer give a role when members achieve the level **${args[0]}**.`);

    Kwako.log.info({msg: 'dellevelrole', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, level: args[0]})
};

module.exports.help = {
    name: 'dellevelrole',
    usage: "dellevelrole (level number)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};