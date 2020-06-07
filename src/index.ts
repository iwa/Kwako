import * as Discord from "discord.js";
const bot: Discord.Client = new Discord.Client()
const commands: Discord.Collection<any, any> = new Discord.Collection();

import * as dotenv from "dotenv";
dotenv.config();

import Enmap = require('enmap');
const settings = new Enmap({
    name: "settings",
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

const defaultSettings = {
    prefix: "!",
    welcomeMessage: "",
    starboardChannel: ""
}

import * as fs from 'fs';

import { MongoClient } from 'mongodb';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

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
    ready(bot)
    console.log(`info: logged in as ${bot.user.username}`);
});

// Message Event
bot.on('message', async (msg: Discord.Message) => {
    if(!msg.guild || msg.author.bot) return;
    if (msg.channel.type != "text") return;

    const guildConf = settings.ensure(msg.guild.id, defaultSettings);

    await cooldown.message(msg);

    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);

    if (!msg.content.startsWith(guildConf.prefix))
        return cooldown.exp(msg, mongod, db);

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = commands.get(req);

    if (process.env.SLEEP === '1' && msg.author.id != process.env.IWA) return;

    if (!cmd) return;
    else await cmd.run(bot, msg, args, db, settings);

    return setTimeout(async () => {
        await mongod.close()
    }, 31000);
});


bot.on("guildMemberAdd", async member => {
    settings.ensure(member.guild.id, defaultSettings);
    let welcomeMessage = settings.get(member.guild.id, "welcomeMessage");

    if(!welcomeMessage) return;

    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.tag)
    welcomeMessage = welcomeMessage.replace("{{guild}}", member.guild.name)

    try {
        await member.send(welcomeMessage)
    } catch {
        return;
    }
  });


bot.on("guildDelete", guild => {
    settings.delete(guild.id);
});


// Starboard Event
import starboard from './events/starboard';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    settings.ensure(reaction.message.guild.id, defaultSettings);
    let starboardChannel = settings.get(reaction.message.guild.id, "starboardChannel");

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
    reactionRoles.add(reaction, author);
});
bot.on('messageReactionRemove', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    reactionRoles.remove(reaction, author);
});

// Login
bot.login(process.env.TOKEN)