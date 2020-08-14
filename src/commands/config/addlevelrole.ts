import { Client, Message, Presence } from 'discord.js';
import { Db } from 'mongodb'
import utilities from '../../utils/utilities';
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length < 2) return;
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    if(!guildConf) {
        await db.collection('settings').insertOne({ '_id': msg.guild.id });
        guildConf = { '_id': msg.guild.id };
    }
    let levelroles:string = guildConf.levelroles ? guildConf.levelroles : "[]";
    let levelrolesMap:Map<number, Array<string>> = new Map(JSON.parse(levelroles));

    if(parseInt(args[0]) < 2 || parseInt(args[0]) > 50)
        return msg.channel.send(":x: > Please choose a valid level number between 2 and 50!")

    let role = args[1];
    if(role.startsWith('<@&') && role.endsWith('>')) {
        role = role.slice(3, (role.length-1))
        let chan = await msg.guild.roles.fetch(role);
        if(!chan || !chan.editable)
            return msg.channel.send(":x: > That role doesn't exist!")
    } else
        return msg.reply('please mention a role!')

    let previous = args[2] || null;
    if(previous && previous.startsWith('<@&') && previous.endsWith('>')) {
        previous = previous.slice(3, (previous.length-1))
        let chan = await msg.guild.roles.fetch(previous);
        if(!chan || !chan.editable)
            return msg.channel.send(":x: > The previous role doesn't exist!")
    } else if(previous)
        return msg.reply('please mention a role!')


    levelrolesMap.set(parseInt(args[0]), [role, previous]);

    levelroles = JSON.stringify([...levelrolesMap]);

    await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

    await giveRoleToUpper(msg, db, role, parseInt(args[0]));

    await msg.channel.send(`I'll now give the role <@&${role}> to members when they reach the level **${args[0]}** and to members currently above this level.`);
    if (previous)
        await msg.channel.send(`When I'll give this role, I'll remove <@&${previous}>.`)

    log.info({msg: 'addlevelrole', author: msg.author.id, guild: msg.guild.id, level: { id: args[0], role: role }})
};

module.exports.help = {
    name: 'addlevelrole',
    usage: "addlevelrole (level number) (mention role)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};

async function giveRoleToUpper (msg:Message, db:Db, role:string, level:number) {
    let exp = utilities.expForLevel(level-1);
    let guild = `exp.${msg.guild.id.toString()}`
    let list = await db.collection('user').find({ [guild]: { $gte: exp } }).toArray();

    if(list) {
        for(const user of list) {
            let member = await msg.guild.members.fetch(user._id).catch(() => {return});
            if(member)
                await member.roles.add(role).catch(() => {return});
        }
    }
}