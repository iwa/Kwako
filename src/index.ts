import * as Discord from "discord.js";
const bot: Discord.Client = new Discord.Client()
const commands: Discord.Collection<any, any> = new Discord.Collection();

import * as dotenv from "dotenv";
dotenv.config();

import log from './Logger';

import * as fs from 'fs';
import * as http from 'http';

import { MongoClient, Db } from 'mongodb';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;
let mongod: MongoClient, db: Db;

(async () => {
    mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    db = mongod.db(dbName);
})()

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


// Imports commands from the 'commands' folder
fs.readdir('./build/commands/', { withFileTypes: true }, (error, f) => {
    if (error) return log.error(error);
    f.forEach((f) => {
        if (f.isDirectory()) {
            fs.readdir(`./build/commands/${f.name}/`, (error, fi) => {
                if (error) return log.error(error);
                fi.forEach((fi) => {
                    if (!fi.endsWith(".js")) return;
                    let commande = require(`./commands/${f.name}/${fi}`);
                    commands.set(commande.help.name, commande);
                })
            })
        } else {
            if (!f.name.endsWith(".js")) return;
            let commande = require(`./commands/${f.name}`);
            commands.set(commande.help.name, commande);
        }
    });
});

// Process related Events
process.on('uncaughtException', exception => log.error(exception));
process.on('unhandledRejection', exception => log.error(exception));

// Bot-User related Events
bot.on('warn', (warn) => log.warn(warn));
bot.on('shardError', (error) => log.error(error));
bot.on('shardDisconnect', (event) => log.debug({msg: "bot disconnected", event: event}));
bot.on('shardReconnecting', (event) => log.debug({msg: "bot reconnecting", event: event}));
bot.on('shardResume', async () => ready(bot, db));
bot.on('shardReady', async () => {
    ready(bot, db);
    log.debug(`logged in as ${bot.user.username}`);
});

// Message Event
bot.on('message', async (msg: Discord.Message) => {
    if (!msg) return;
    if (msg.author.bot) return;
    if (!msg.guild) return log.trace({msg: 'dm', author: { id: msg.author.id, name: msg.author.tag }, content: msg.cleanContent, attachment: msg.attachments.first()});
    if (msg.channel.type != "text") return;

    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config || defaultSettings;
    let disabled: string[] = guildConf.disabledCommands || [];

    await cooldown.message(msg, guildConf);

    if (msg.channel.id === guildConf.suggestionChannel)
        return suggestion(bot, msg, db);

    if (!msg.content.startsWith(guildConf.prefix))
        return cooldown.exp(msg, db);

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = commands.get(req) || commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(req));

    if (talkedRecently.has(msg.author.id)) {
        const embed = new Discord.MessageEmbed()
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

        talkedRecently.add(msg.author.id);
		setTimeout(() => {
			talkedRecently.delete(msg.author.id);
        }, 3000);

        await cmd.run(bot, msg, args, db, log, commands, guildConf);
    }
});


bot.on("guildMemberAdd", async member => {
    if(!member.guild.available) return;

    let guild = await db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    let guildConf = guild.config || defaultSettings;

    let userDB = await db.collection('user').findOne({ _id: member.id });
    let guildDB = `exp.${member.guild.id.toString()}`
    if (userDB) {
        if(userDB.exp[member.guild.id] < 0) {
            await db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 }});
            userDB.exp[member.guild.id] *= -1;
        }

        let levelroles:string = guild.levelroles || "[]";
        let levelrolesMap:Map<number, Array<string>> = new Map(JSON.parse(levelroles));
        let lvl = utilities.levelInfo(userDB.exp[member.guild.id]);

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

bot.on('guildCreate', async guild => {
    if(!guild.available) return;

    let channel = guild.channels.cache.find(val => val.name.includes('general') && val.type === 'text');
    if(channel) {
        await (channel as Discord.TextChannel).send({
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
            await (channel as Discord.TextChannel).send('Hey, thanks for inviting me!\n\nCheck out the official website to configure me:\nhttps://kwako.iwa.sh/').catch(() => {return;})
            await (channel as Discord.TextChannel).send(':x: **Some needed perms are unavailable. Please give me all the required permissions or I won\'t be able to work normally.**').catch(() => {return;})
        }
    }
    await db.collection('settings').insertOne({ '_id': guild.id });
    http.get('http://localhost:8080/api/guilds/update').on("error", log.error);

    log.info({msg: 'new guild', guild: guild.id});
});

bot.on("guildDelete", async guild => {
    await db.collection('settings').deleteOne({ '_id': { $eq: guild.id } });
    http.get('http://localhost:8080/api/guilds/update').on("error", log.error);
    log.info({msg: 'guild removed', guild: guild.id});
});


// Starboard Event
import starboard from './events/starboard';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    if(!reaction.message.guild.available) return;

    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: reaction.message.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let starboardChannel = guildConf.starboardChannel;
    if(!starboardChannel) return;

    await starboard.check(reaction, author, bot, starboardChannel);
});

// Reaction Role Events
import reactionRoles from './events/reactionRoles';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    if(!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.add(reaction, author, db);
});
bot.on('messageReactionRemove', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    if(!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.remove(reaction, author, db);
});

// Logs channel
import messageDelete from './events/logs/messageDelete';
bot.on('messageDelete', async msg => {
    if(!msg.guild.available) return;

    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

    return messageDelete(msg, bot, modLogChannel, guildConf.prefix, guildConf.suggestionChannel);
});

import guildMemberRemove from './events/logs/guildMemberRemove';
bot.on('guildMemberRemove', async member => {
    if(!member.guild.available) return;

    let guildDB = `exp.${member.guild.id.toString()}`
    await db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 }});

    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildMemberRemove(member, bot, modLogChannel);
});

import guildBanAdd from './events/logs/guildBanAdd';
import utilities from "./utils/utilities";
bot.on('guildBanAdd', async (guild, user) => {
    if(!guild.available) return;

    let guildDB = `exp.${guild.id.toString()}`
    await db.collection('user').updateOne({ _id: user.id }, { $unset: { [guildDB]: 0 }});

    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: guild.id } });
    guildConf = guildConf.config || defaultSettings;

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildBanAdd(guild, user, bot, modLogChannel);
});

// Login
bot.login(process.env.TOKEN)