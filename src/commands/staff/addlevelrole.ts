import { Client, Message } from 'discord.js';
import { Db } from 'mongodb'
import utilities from '../../utils/utilities';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;
    if (args.length != 2) return;
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    let levelroles:string = guildConf.levelroles ? guildConf.levelroles : "[]";
    let levelrolesMap:Map<number, string> = new Map(JSON.parse(levelroles));

    if(parseInt(args[0]) < 2 || parseInt(args[0]) > 100)
        return msg.channel.send(":x: > Please choose a valid level number between 2 and 100!")

    let role = args[1];
    if(role.startsWith('<@&') && role.endsWith('>')) {
        role = role.slice(3, (role.length-1))
        let chan = await msg.guild.roles.fetch(role);
        if(!chan || !chan.editable)
            return msg.channel.send(":x: > That role doesn't exist!")
    } else
        return msg.reply('please mention a role!')

    levelrolesMap.set(parseInt(args[0]), role)

    levelroles = JSON.stringify([...levelrolesMap]);

    await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

    await giveRoleToUpper(msg, db, role, parseInt(args[0]));

    return msg.channel.send(`I'll now give the role <@&${role}> to members when they reach the level **${args[0]}** and to members currently above this level.`);
};

module.exports.help = {
    name: 'addlevelrole',
    usage: "addlevelrole (level number) (mention role)",
    staff: true
};

async function giveRoleToUpper (msg:Message, db:Db, role:string, level:number) {
    let exp = utilities.expForLevel(level);
    let guild = `exp.${msg.guild.id.toString()}`
    let list = await db.collection('user').find({ [guild]: { $gte: exp } }).toArray();

    if(list) {
        for(const user of list) {
            let member = await msg.guild.members.fetch(user._id);
            await member.roles.add(role).catch(() => {return});
        }
    }
}