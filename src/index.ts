import * as dotenv from "dotenv";
dotenv.config();

import Kwako from './Client';

import { MessageReaction, User, Message, MessageEmbed, TextChannel } from 'discord.js';
import http from 'http';

const defaultSettings = {
    prefix: "!",
    welcomeMessage: "",
    starboardChannel: "",
    muteRole: "",
    modLogChannel: "",
    suggestionChannel: "",
    disabledCommands: [] as string[]
}

let talkedRecently = new Set();

import cooldown from './events/messages/cooldown';
import ready from './events/ready';
import suggestion from './events/messages/suggestion';

// Process related Events
process.on('uncaughtException', exception => Kwako.log.error(exception));
process.on('unhandledRejection', exception => Kwako.log.error(exception));

// Bot-User related Events
Kwako.on('warn', (warn) => Kwako.log.warn(warn));
Kwako.on('shardError', (error) => Kwako.log.error(error));
Kwako.on('shardDisconnect', (event) => Kwako.log.debug({msg: "Kwako disconnected", event: event}));
Kwako.on('shardReconnecting', (event) => Kwako.log.debug({msg: "Kwako reconnecting", event: event}));
Kwako.on('shardResume', async () => ready());
Kwako.on('shardReady', async () => {
    ready();
    Kwako.log.debug(`logged in as ${Kwako.user.username}`);
});

// Message Event
Kwako.on('message', async (msg: Message) => {
    if (!msg) return;
    if (msg.author.bot) return;
    if (!msg.guild) return Kwako.log.trace({msg: 'dm', author: { id: msg.author.id, name: msg.author.tag }, content: msg.cleanContent, attachment: msg.attachments.first()});
    if (msg.channel.type != "text") return;

    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config || defaultSettings;
    let disabled: string[] = guildConf.disabledCommands || [];

    await cooldown.message(msg, guildConf);

    if (msg.channel.id === guildConf.suggestionChannel)
        return suggestion(msg);

    if (!msg.content.startsWith(guildConf.prefix))
        return cooldown.exp(msg);

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = Kwako.commands.get(req) || Kwako.commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(req));

    if (talkedRecently.has(msg.author.id)) {
        const embed = new MessageEmbed()
					.setTitle('⌛ Command Cooldown')
					.setColor('#e67e22')
					.setDescription(`${msg.author}, please wait 3s before sending your next command!`);
        let sent = await msg.channel.send(embed);
        return setTimeout(async () => { await sent.delete(); }, 3000);
    }
    if (process.env.SLEEP === '1' && msg.author.id != process.env.IWA) return;

    if (!cmd || disabled.includes(cmd.help.name)) return;
    else {
        if (cmd.help.perms && !msg.guild.me.hasPermission(cmd.help.perms))
            return msg.channel.send(`**❌ Sorry, I need the following permissions to execute this command**\n\`${cmd.help.perms.join('`, `')}\``).catch(() => { return; });

        if (!msg.member.hasPermission('MANAGE_GUILD')) {
            talkedRecently.add(msg.author.id);
		    setTimeout(() => {
		    	talkedRecently.delete(msg.author.id);
            }, 3000);
        }

        await cmd.run(msg, args, guildConf);
    }
});


Kwako.on("guildMemberAdd", async member => {
    if(!member.guild.available) return;

    let guild = await Kwako.db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    let guildConf = guild.config || defaultSettings;

    let userDB = await Kwako.db.collection('user').findOne({ _id: member.id });
    let guildDB = `exp.${member.guild.id.toString()}`
    if (userDB) {
        if(!userDB.exp) return;

        if(userDB.exp[member.guild.id] < 0) {
            await Kwako.db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 }});
            userDB.exp[member.guild.id] *= -1;
        }

        let levelroles:string = guild.levelroles || "[]";
        let levelrolesMap:Map<number, Array<string>> = new Map(JSON.parse(levelroles));

        let exp = userDB.exp[member.guild.id] || 0;
        let lvl = utilities.levelInfo(exp);

        levelrolesMap.forEach(async (value, key) => {
            if(key <= lvl.level) {
                if(member && value && value[0]) {
                    await member.roles.add(value[0]).catch(() => {return});
                    if (value[1])
                        await member.roles.remove(value[1]).catch(() => {return});
                }
            }
        });
    }

    let welcomeMessage = guildConf.welcomeMessage;

    if(!welcomeMessage) return;

    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.username)
    welcomeMessage = welcomeMessage.replace("{{guild}}", member.guild.name)

    try {
        await member.send(welcomeMessage)
    } catch {
        return;
    }
});

Kwako.on('guildCreate', async guild => {
    if(!guild.available) return;

    let channel = guild.channels.cache.find(val => val.name.includes('general') && val.type === 'text');
    if(channel) {
        await (channel as TextChannel).send({
            "embed": {
              "title": "Hey, thanks for inviting me!",
              "description": "Here are some useful tips to begin with:",
              "color": 16774804,
              "footer": {
                "text": "💛"
              },
              "fields": [
                {
                  "name": "Web Dashboard",
                  "value": "https://kwako.iwa.sh/",
                  "inline": true
                },
                {
                  "name": "List of the commands",
                  "value": "`!help`",
                  "inline": true
                },
                {
                  "name": "Command-specific help",
                  "value": "`!help (command name)`",
                  "inline": true
                },
                {
                  "name": "Support Server",
                  "value": "https://discord.gg/4ZFYUcw",
                  "inline": true
                }
              ]
            }
          }).catch(() => {return;})
        if(!guild.me.permissions.has(305523776)) {
            await (channel as TextChannel).send('Hey, thanks for inviting me!\n\nCheck out the official website to configure me:\nhttps://kwako.iwa.sh/').catch(() => {return;})
            await (channel as TextChannel).send(':x: **Some needed perms are unavailable. Please give me all the required permissions or I won\'t be able to work normally.**').catch(() => {return;})
        }
    }
    await Kwako.db.collection('settings').insertOne({ '_id': guild.id });
    http.get('http://localhost:8080/api/guilds/update').on("error", Kwako.log.error);

    Kwako.log.info({msg: 'new guild', guild: { id: guild.id, name: guild.name }});
});

Kwako.on("guildDelete", async guild => {
    await Kwako.db.collection('settings').deleteOne({ '_id': { $eq: guild.id } });
    http.get('http://localhost:8080/api/guilds/update').on("error", Kwako.log.error);
    Kwako.log.info({msg: 'guild removed', guild: { id: guild.id, name: guild.name }});
});


// Starboard Event
import starboard from './events/starboard';
Kwako.on('messageReactionAdd', async (reaction: MessageReaction, author: User) => {
    if(!reaction.message.guild.available) return;

    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: reaction.message.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let starboardChannel = guildConf.starboardChannel;
    if(!starboardChannel) return;

    await starboard.check(reaction, author, starboardChannel);
});

// Reaction Role Events
import reactionRoles from './events/reactionRoles';
Kwako.on('messageReactionAdd', async (reaction: MessageReaction, author: User) => {
    if(!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.add(reaction, author);
});
Kwako.on('messageReactionRemove', async (reaction: MessageReaction, author: User) => {
    if(!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.remove(reaction, author);
});

// Logs channel
import messageDelete from './events/logs/messageDelete';
Kwako.on('messageDelete', async msg => {
    if(!msg.guild.available) return;

    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

    return messageDelete(msg, modLogChannel, guildConf.prefix, guildConf.suggestionChannel);
});

import guildMemberRemove from './events/logs/guildMemberRemove';
Kwako.on('guildMemberRemove', async member => {
    if(!member.guild.available) return;

    let guildDB = `exp.${member.guild.id.toString()}`
    await Kwako.db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 }});

    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildMemberRemove(member, modLogChannel);
});

import guildBanAdd from './events/logs/guildBanAdd';
import utilities from "./utils/utilities";
Kwako.on('guildBanAdd', async (guild, user) => {
    if(!guild.available) return;

    let guildDB = `exp.${guild.id.toString()}`
    await Kwako.db.collection('user').updateOne({ _id: user.id }, { $unset: { [guildDB]: 0 }});

    let guildConf = await Kwako.db.collection('settings').findOne({ '_id': { $eq: guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildBanAdd(guild, user, modLogChannel);
});

// Login
Kwako.start(process.env.TOKEN);