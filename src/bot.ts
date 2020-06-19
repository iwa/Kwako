import * as Discord from "discord.js";
const bot: Discord.Client = new Discord.Client()
const commands: Discord.Collection<any, any> = new Discord.Collection();

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from 'fs';
import * as https from 'https';

import { MongoClient } from 'mongodb';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

const defaultSettings = {
    prefix: "!",
    welcomeMessage: "",
    starboardChannel: "",
    muteRole: "",
    modLogChannel: ""
}

import cooldown from './events/messages/cooldown';
import ready from './events/ready';


// Imports commands from the 'commands' folder
fs.readdir('./build/commands/', { withFileTypes: true }, (error, f) => {
    if (error) return console.error(error);
    f.forEach((f) => {
        if (f.isDirectory()) {
            fs.readdir(`./build/commands/${f.name}/`, (error, fi) => {
                if (error) return console.error(error);
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
process.on('uncaughtException', exception => console.error(exception));

// Bot-User related Events
bot.on('warn', console.warn);
bot.on('shardError', console.error);
bot.on('shardDisconnect', () => console.log("warn: bot disconnected"));
bot.on('shardReconnecting', () => console.log("info: bot reconnecting..."));
bot.on('shardResume', async () => ready(bot));
bot.on('shardReady', async () => {
    setTimeout(async () => ready(bot), 1000);
    console.log(`info: logged in as ${bot.user.username}`);
});

// Message Event
bot.on('message', async (msg: Discord.Message) => {
    if(!msg.guild || msg.author.bot) return;
    if (msg.channel.type != "text") return;

    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await cooldown.message(msg, guildConf);

    if (!msg.content.startsWith(guildConf.prefix))
        return cooldown.exp(msg, mongod, db);

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = commands.get(req);

    if (process.env.SLEEP === '1' && msg.author.id != process.env.IWA) return;

    if (!cmd) return;
    else await cmd.run(bot, msg, args, db, commands);

    return setTimeout(async () => {
        await mongod.close()
    }, 1000);
});


bot.on("guildMemberAdd", async member => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await mongod.close()

    let welcomeMessage = guildConf.welcomeMessage;

    if(!welcomeMessage) return;

    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)
    welcomeMessage = welcomeMessage.replace("{{guild}}", member.guild.name)

    try {
        await member.send(welcomeMessage)
    } catch {
        return;
    }
});

bot.on('guildCreate', async guild => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let channel = guild.channels.cache.find(val => val.name === 'general');
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
                  "name": "How to configure me:",
                  "value": "https://iwa.sh/Kwako",
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
                }
              ]
            }
          }).catch(() => {return;})
        if(!guild.me.permissions.has(305523776))
            await (channel as Discord.TextChannel).send(':x: **Some needed perms are unavailable. Quitting. Please re-invite me with all the needed perms.**').catch(() => {return;})
    }
    if(!guild.me.permissions.has(305523776))
        await guild.leave();
    await db.collection('settings').insertOne({ '_id': guild.id });
    await mongod.close()
    https.get('https://kwako.iwa.sh/api/guilds/update').on("error", console.error);
});

bot.on("guildDelete", async guild => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);

    await db.collection('settings').deleteOne({ '_id': { $eq: guild.id } });
    await mongod.close()
    https.get('https://kwako.iwa.sh/api/guilds/update').on("error", console.error);
});


// Starboard Event
import starboard from './events/starboard';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: reaction.message.guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await mongod.close()

    let starboardChannel = guildConf.starboardChannel;

    if(!starboardChannel) return;

    await starboard.check(reaction, author, bot);
});

// MemberLeave Event
import memberLeave from './events/memberLeave'
bot.on('guildMemberRemove', async member => {
    memberLeave(member)
})

// Reaction Role Events
import reactionRoles from './events/reactionRoles';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    if (author.bot) return;
    reactionRoles.add(reaction, author);
});
bot.on('messageReactionRemove', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    if (author.bot) return;
    reactionRoles.remove(reaction, author);
});

// Logs channel
import messageDelete from './events/logs/messageDelete';
bot.on('messageDelete', async msg => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await mongod.close()

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

    return messageDelete(msg, bot, modLogChannel);
});

import guildMemberRemove from './events/logs/guildMemberRemove';
bot.on('guildMemberRemove', async member => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await mongod.close()

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildMemberRemove(member, bot, modLogChannel);
});

import guildBanAdd from './events/logs/guildBanAdd';
bot.on('guildBanAdd', async (guild, user) => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await db.collection('settings').findOne({ '_id': { $eq: guild.id } });
    guildConf = guildConf.config ? guildConf.config : defaultSettings;

    await mongod.close()

    let modLogChannel = guildConf.modLogChannel;
    if(!modLogChannel) return;

	return guildBanAdd(guild, user, bot, modLogChannel);
});

// Update guilds count every 5min
setInterval(async () => {
    if(process.env.SLEEP == '0') {
        let guilds = await bot.shard.fetchClientValues('guilds.cache.size')
        await bot.user.setActivity(`with ${guilds.reduce((prev, guildCount) => prev + guildCount, 0)} guilds`, { type: 0 }).catch(console.error);
    }
}, 300000);

// Login
bot.login(process.env.TOKEN)