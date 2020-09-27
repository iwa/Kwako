import Kwako from '../../Client';
import { Message, MessageEmbed } from 'discord.js';
import utilities from '../../utils/utilities';

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    guildConf.useExpSystem &&= true;
    if(!guildConf.useExpSystem)
        return msg.channel.send({'embed':{
            'title': ':x: You need to enable the experience system in order to use level roles'
        }});

    if (args.length === 0) return msg.channel.send({'embed':{
        'title': `\`${guildConf.prefix}levelrole (add|remove|list)\``
    }});

    let guild = await Kwako.db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });

    let levelroles:string = guild.levelroles || "[]";
    let levelrolesMap:Map<number, Array<string>> = new Map(JSON.parse(levelroles));

    switch (args[0]) {
        // Add
        case 'add':
            if (args.length < 3) return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}levelrole add (level number) (mention role) [mention previous role]\``
            }});

            if(parseInt(args[1], 10) < 1 || parseInt(args[1], 10) > 50)
                return msg.channel.send({'embed':{
                    'title': ':x: Please choose a valid level number between 1 and 50!'
                }})

            let role = args[2] || "";
            if(role.startsWith('<@&') && role.endsWith('>')) {
                role = role.slice(3, (role.length-1))
                let chan = await msg.guild.roles.fetch(role);
                if(!chan || !chan.editable)
                    return msg.channel.send({'embed':{
                        'title': ":x: This role doesn't exist!"
                    }})
            } else
                return msg.channel.send({'embed':{
                    'title': `:x: ${msg.author.username}, please mention a role!`
                }})

            let previous = args[3] || null;
            if(parseInt(args[1], 10) === 1)
                previous = null;

            if(previous && previous.startsWith('<@&') && previous.endsWith('>')) {
                previous = previous.slice(3, (previous.length-1))
                let chan = await msg.guild.roles.fetch(previous);
                if(!chan || !chan.editable)
                    return msg.channel.send({'embed':{
                        'title': ":x: The previous role doesn't exist!"
                    }})
            } else if(previous)
                return msg.channel.send({'embed':{
                    'title': `:x: ${msg.author.username}, please mention a role!`
                }})

            levelrolesMap.set(parseInt(args[1], 10), [role, previous]);

            levelroles = JSON.stringify([...levelrolesMap]);

            await Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

            await msg.react('🔄');
            await giveRoleToUpper(msg, role, parseInt(args[1], 10));

            let addEmbed = new MessageEmbed()
                            .setTitle('✅ New Level Role Added')
                            .addField('Role', `<@&${role}>`, true)
                            .addField('at Level', args[1], true);

            if (previous)
                addEmbed.addField('Previous Role', `When members reach the level ${args[1]}, I'll remove <@&${previous}> from their roles.`, false);

            await msg.channel.send(addEmbed);
            Kwako.log.info({msg: 'levelrole add', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, levelrole: { id: args[1], role: role }})
        return;

        // Remove
        case 'remove':
            if (args.length < 2) return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}levelrole remove (level number)\``
            }});

            if(parseInt(args[1], 10) < 1 || parseInt(args[1], 10) > 50)
                return msg.channel.send({'embed':{
                    'title': ':x: Please choose a valid level number between 1 and 50!'
                }});

            if(!levelrolesMap.has(parseInt(args[1], 10)))
                return  msg.channel.send({'embed':{
                    'title': ':x: Deletion impossible',
                    'description': "There's no Level Role set at this level"
                }})

            let removeRole = (levelrolesMap.get(parseInt(args[1], 10)))[0];
            levelrolesMap.delete(parseInt(args[1], 10))

            levelroles = JSON.stringify([...levelrolesMap]);

            await Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { levelroles: levelroles }}, { upsert: true })

            let removeEmbed = new MessageEmbed()
                            .setTitle('🚮 Level Role Removed')
                            .addField('Role', `<@&${removeRole}>`, true)
                            .addField('at Level', args[1], true);

            await msg.channel.send(removeEmbed);

            Kwako.log.info({msg: 'levelrole remove', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, levelrole: args[1]})
        return;

        // List
        case 'list':
            let list = "";

            for(const levelrole of levelrolesMap) {
                let chan = await msg.guild.roles.fetch(levelrole[1][0]);
                if (!chan || !chan.editable) return;
                list = `${list}${levelrole[0]} > ${chan.name}\n`;
            }

            if(levelrolesMap.size === 0)
                list = 'nothing!'

            await msg.channel.send({ "embed": {
                "title": "📃 Level Roles List",
                "description": `\`\`\`${list}\`\`\``
            }});
        return;

        default:
            return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}levelrole (add|remove|list)\``
            }});
    }
};

module.exports.help = {
    name: 'levelrole',
    usage: "levelrole (add|remove|list)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};

async function giveRoleToUpper (msg: Message, role: string, level: number) {
    let exp = utilities.expForLevel(level-1);
    let guild = `exp.${msg.guild.id.toString()}`

    if(level === 1) {
        let list = msg.guild.members.cache.filter(m => !m.user.bot).values();
        if(list) {
            for(const member of list) {
                if(member)
                    await member.roles.add(role).catch(() => {return});
            }
        }
    } else {
        let list = await Kwako.db.collection('user').find({ [guild]: { $gte: exp } }).toArray();
        if(list) {
            for(const user of list) {
                let member = await msg.guild.members.fetch(user._id).catch(() => {return});
                if(member)
                    await member.roles.add(role).catch(() => {return});
            }
        }
    }
}