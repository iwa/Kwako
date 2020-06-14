import * as Discord from "discord.js";
const bot: Discord.Client = new Discord.Client()
const commands: Discord.Collection<any, any> = new Discord.Collection();

import * as dotenv from "dotenv";
dotenv.config();

import * as fs from 'fs';

import { MongoClient } from 'mongodb';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

const settings = new Map();
const defaultSettings = {
    prefix: "!",
    welcomeMessage: "",
    starboardChannel: "",
    muteRole: ""
}
settings.set('_default', defaultSettings)

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

    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await settings.get(msg.guild.id);

    if(!guildConf) {
        guildConf = await db.collection('settings').findOne({ '_id': { $eq: msg.guild.id } });
        guildConf = guildConf ? guildConf.config : defaultSettings;
        settings.set(msg.guild.id, guildConf);
    }

    await cooldown.message(msg);

    if (!msg.content.startsWith(guildConf.prefix))
        return cooldown.exp(msg, mongod, db);

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = commands.get(req);

    if (process.env.SLEEP === '1' && msg.author.id != process.env.IWA) return;

    if (!cmd) return;
    else await cmd.run(bot, msg, args, db, commands, settings);

    return setTimeout(async () => {
        await mongod.close()
    }, 31000);
});


bot.on("guildMemberAdd", async member => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await settings.get(member.guild.id);

    if(!guildConf) {
        guildConf = await db.collection('settings').findOne({ '_id': { $eq: member.guild.id } });
        guildConf = guildConf ? guildConf.config : defaultSettings;
        settings.set(member.guild.id, guildConf);
    }

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
    let channel = guild.channels.cache.find(val => val.name === 'general');
    if(channel) {
        try {
            (channel as Discord.TextChannel).send('Hey, thanks for inviting me!\nYou can learn how to configure me here:\nhttps://iwa.sh/Kwako')
        } catch (error) {
            return;
        }
    }
});

bot.on("guildDelete", async guild => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);

    settings.delete(guild.id);
    await db.collection('settings').deleteOne({ '_id': { $eq: guild.id } });
    await mongod.close()
});


// Starboard Event
import starboard from './events/starboard';
bot.on('messageReactionAdd', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
    let db = mongod.db(dbName);
    let guildConf = await settings.get(reaction.message.guild.id);

    if(!guildConf) {
        guildConf = await db.collection('settings').findOne({ '_id': { $eq: reaction.message.guild.id } });
        guildConf = guildConf ? guildConf.config : defaultSettings;
        settings.set(reaction.message.guild.id, guildConf);
    }

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
    reactionRoles.add(reaction, author);
});
bot.on('messageReactionRemove', async (reaction: Discord.MessageReaction, author: Discord.User) => {
    reactionRoles.remove(reaction, author);
});

// Update guilds count every 5min
setInterval(async () => {
    if(process.env.SLEEP == '0')
        await bot.user.setPresence({ activity: { name: `with ${bot.guilds.cache.size} guilds`, type: 0 }, status: 'online' })
}, 300000);

// Login
bot.login(process.env.TOKEN)