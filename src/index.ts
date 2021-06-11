import dotenv from "dotenv";
dotenv.config();

import Kwako from './Client';

import { MessageReaction, User, Message, MessageEmbed, TextChannel, Util, VoiceChannel, GuildChannel } from 'discord.js';
import { Manager } from "erela.js";

let talkedRecently = new Set();

import cooldown from './events/messages/cooldown';
import ready from './events/ready';
import suggestion from './events/messages/suggestion';

// Process related Events
process.on('uncaughtException', async exception => Kwako.log.error(exception));
process.on('unhandledRejection', async exception => Kwako.log.error(exception));

// Bot-User related Events
Kwako.on('warn', (warn) => Kwako.log.warn(warn));
Kwako.on('shardError', (error) => Kwako.log.error(error));
Kwako.on('shardDisconnect', (event) => Kwako.log.debug({ msg: "Kwako disconnected", event: event }));
Kwako.on('shardReconnecting', (event) => Kwako.log.debug({ msg: "Kwako reconnecting", event: event }));
Kwako.on('shardResume', async () => await ready());
Kwako.once('shardReady', async () => {
    await ready();
    Kwako.log.debug(`logged in as ${Kwako.user.username}`);

    Kwako.music = new Manager({
        nodes: [
            {
                identifier: 'default',
                host: process.env.LAVALINK_HOST,
                port: parseInt(process.env.LAVALINK_PORT, 10),
                password: process.env.LAVALINK_PWD,
                secure: false,
                retryAmount: 10,
                retryDelay: 5000
            },
        ],
        autoPlay: true,
        send(id, payload) {
            const guild = Kwako.guilds.cache.get(id);
            if (guild) guild.shard.send(payload);
        },
    }).on("nodeConnect", (node) => Kwako.log.info({ msg: 'new lavalink node', node: node.options.identifier }))
        .on("nodeError", (node, error) => Kwako.log.error({ msg: `lavalink node error\n${error.message}`, node: node.options.identifier }))
        .on("trackStart", async (player, track) => {
            if (!player.trackRepeat) {
                let channel: any = Kwako.channels.cache.get(player.textChannel);
                if (!channel) return;

                let timeString;
                if (!track.isStream) {
                    let date = new Date(track.duration);
                    timeString = `Length: ${date.toISOString().substr(11, 8)}`
                } else
                    timeString = '🔴 Listening to a stream'

                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setTitle(":cd: Now Playing")
                    .setDescription(`[${Util.escapeMarkdown(track.title)}](${track.uri})`)
                    .setFooter(timeString)
                    .setThumbnail(track.thumbnail)
                await channel.send(embed)
                Kwako.log.info({ msg: 'music playing', author: { id: (track.requester as any).id, name: (track.requester as any).tag }, guild: { id: channel.guild.id, name: channel.guild.name }, song: { name: Util.escapeMarkdown(track.title), url: track.uri } });
            }
        })
        .on("trackStuck", async (player, track, payload) => {
            let channel: any = Kwako.channels.cache.get(player.textChannel);
            if (!channel) return;

            const embed = new MessageEmbed()
                .setTitle(":x: There's a problem with the track")
                .setDescription(`Nothing will be played for ${Math.ceil(payload.thresholdMs / 1000)}s`)
            await channel.send(embed)
        })
        .on("trackError", async (player, track, payload) => {
            let channel: any = Kwako.channels.cache.get(player.textChannel);
            if (!channel) return;

            const embed = new MessageEmbed()
                .setTitle(":x: There's a problem with the track")
                .setDescription(`Error: ${payload.error}\nReason: ${payload.exception.message}\nCause: ${payload.exception.cause}`)
            await channel.send(embed)
        })
        .on("queueEnd", async (player) => {
            setTimeout(async () => {
                if (!player.playing)
                    player.destroy();
            }, 60000);
        });

    Kwako.music.init(Kwako.user.id);

    Kwako.on("raw", d => Kwako.music.updateVoiceState(d));
});

// Message Event
Kwako.on('message', async (msg: Message) => {
    if (!msg) return;
    if (msg.author.bot) return;
    if (!msg.guild) return Kwako.log.trace({ msg: 'dm', author: { id: msg.author.id, name: msg.author.tag }, content: msg.cleanContent, attachment: msg.attachments.first() });
    if (msg.channel.type !== "text") return;

    let guildConf = await Kwako.getGuildConf(msg.guild.id);
    let disabled: string[] = guildConf.disabledCommands || [];

    //await cooldown.message(msg, guildConf);

    if (msg.channel.id === guildConf.suggestionChannel)
        return suggestion(msg, Kwako.patrons.has(msg.guild.ownerID));

    if (!msg.content.startsWith(guildConf.prefix)) {
        if (msg.mentions.has(Kwako.user.id) && !msg.mentions.everyone)
            return msg.channel.send({
                'embed': {
                    'title': 'My prefix here is:',
                    'description': `\`${guildConf.prefix}\``
                }
            })

        if (guildConf.useExpSystem)
            return cooldown.exp(msg, guildConf);

        return;
    }

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

    if (!cmd || disabled.includes(cmd.help.name)) return;
    else {
        if (cmd.help.premium && !Kwako.patrons.has(msg.guild.ownerID))
            return msg.channel.send({
                "embed": {
                    "title": "❌ Sorry, but this feature is premium-only.",
                    "description": "[Become a Patron](https://www.patreon.com/iwa) in order to access the new features before everyone else!",
                    "color": 13901365
                }
            }).catch(() => { return; });

        if (cmd.help.perms && !msg.guild.me.hasPermission(cmd.help.perms))
            return makePermsErrorBetter(msg, cmd);

        if (!msg.member.hasPermission('MANAGE_GUILD')) {
            talkedRecently.add(msg.author.id);
            setTimeout(() => {
                talkedRecently.delete(msg.author.id);
            }, 3000);
        }

        Kwako.log.trace({ msg: msg.cleanContent, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } });
        await cmd.run(msg, args, guildConf);
    }
});

import userJoin from './events/logs/userJoin';
Kwako.on("guildMemberAdd", async member => {
    if (!member.guild.available) return;

    let guild = await Kwako.db.collection('guilds').findOne({ '_id': { $eq: member.guild.id } });

    let muted = await Kwako.db.collection('mute').findOne({ _id: member.id });
    if (member.guild.id in muted.until) await member.roles.add(guild.config['muteRole']);

    let levelroles: string = guild.levelroles || "[]";
    let levelrolesMap: Map<number, Array<string>> = new Map(JSON.parse(levelroles));

    let roles = levelrolesMap.get(1);

    if (roles && roles[0])
        await member.roles.add(roles[0]).catch(() => { return });

    let guildConf = await Kwako.getGuildConf(member.guild.id);

    let userDB = await Kwako.db.collection('user').findOne({ _id: member.id });
    let guildDB = `exp.${member.guild.id.toString()}`
    if (userDB) {
        if (userDB.exp) {
            if (userDB.exp[member.guild.id] < 0) {
                await Kwako.db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 } });
                userDB.exp[member.guild.id] *= -1;
            }

            let levelroles: string = guild.levelroles || "[]";
            let levelrolesMap: Map<number, Array<string>> = new Map(JSON.parse(levelroles));

            let exp = userDB.exp[member.guild.id] || 0;
            let lvl = utilities.levelInfo(exp);

            levelrolesMap.forEach(async (value, key) => {
                if (key <= lvl.level) {
                    if (member && value && value[0]) {
                        await member.roles.add(value[0]).catch(() => { return });
                        if (value[1])
                            await member.roles.remove(value[1]).catch(() => { return });
                    }
                }
            });
        }
    }

    let modLogChannel = guildConf.modLogChannel;
    if (!modLogChannel) {
        userJoin(member, modLogChannel);
    }

    let welcomeMessage = guildConf.welcomeMessage;

    if (!welcomeMessage) return;

    welcomeMessage = welcomeMessage.replace("{{user}}", member.user.username)
    welcomeMessage = welcomeMessage.replace("{{guild}}", member.guild.name)

    try {
        await member.send(welcomeMessage)
    } catch {
        return;
    }
});

Kwako.on('guildCreate', async guild => {
    if (!guild.available) return;

    let channel = guild.channels.cache.find(val => val.type === 'text' && val.name.match(/g(e?)n(e?)r(a?)l/gi) !== null && val.permissionsFor(Kwako.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']));

    if (!channel)
        channel = guild.channels.cache.find(val => val.type === 'text' && val.permissionsFor(Kwako.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']));

    if (channel) {
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
        }).catch(() => { return; })
        if (!guild.me.permissions.has(305523776)) {
            await (channel as TextChannel).send('Hey, thanks for inviting me!\n\nCheck out the official website to configure me:\nhttps://kwako.iwa.sh/').catch(() => { return; })
            await (channel as TextChannel).send(':x: **Some needed perms are unavailable. Please give me all the required permissions or I won\'t be able to work normally.**').catch(() => { return; })
        }
    }

    await Kwako.db.collection('guilds').insertOne({ '_id': guild.id, 'config': Kwako.getDefaultConf() });

    Kwako.log.info({ msg: 'new guild', guild: { id: guild.id, name: guild.name } });
});

Kwako.on("guildDelete", async guild => {
    await Kwako.db.collection('guilds').deleteOne({ '_id': { $eq: guild.id } });
    Kwako.log.info({ msg: 'guild removed', guild: { id: guild.id, name: guild.name } });
});


// Starboard Event
import starboard from './events/starboard';
Kwako.on('messageReactionAdd', async (reaction: MessageReaction, author: User) => {
    if (!reaction.message.guild.available) return;

    let guildConf = await Kwako.getGuildConf(reaction.message.guild.id);

    let starboardChannel = guildConf.starboardChannel;
    if (!starboardChannel) return;

    let customEmote = guildConf.customEmote || "";
    let starReactions = guildConf.starReactions || 5;

    await starboard.check(reaction, author, starboardChannel, customEmote, starReactions);
});

// Reaction Role Events
import reactionRoles from './events/reactionRoles';
Kwako.on('messageReactionAdd', async (reaction: MessageReaction, author: User) => {
    if (!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.add(reaction, author);
});
Kwako.on('messageReactionRemove', async (reaction: MessageReaction, author: User) => {
    if (!reaction.message.guild.available) return;
    if (author.bot) return;
    reactionRoles.remove(reaction, author);
});

// Logs channel
import messageDelete from './events/logs/messageDelete';
Kwako.on('messageDelete', async msg => {
    if (!msg.guild.available) return;

    let guildConf = await Kwako.getGuildConf(msg.guild.id);

    let msgLogChannel = guildConf.msgLogChannel;
    if (!msgLogChannel) return;

    return messageDelete(msg, msgLogChannel, guildConf.prefix, guildConf.suggestionChannel);
});

import messageUpdate from './events/logs/messageUpdate';
Kwako.on('messageUpdate', async (oldmsg, newmsg) => {
    if (!oldmsg.guild) return;
    if (!oldmsg.guild.available) return;

    let guildConf = await Kwako.getGuildConf(oldmsg.guild.id);

    let msgLogChannel = guildConf.msgLogChannel;
    if (!msgLogChannel) return;

    if (!newmsg) return;
    if (oldmsg.cleanContent === newmsg.cleanContent) return;

    return messageUpdate(newmsg, oldmsg, msgLogChannel, guildConf.prefix, guildConf.suggestionChannel);
});

import guildMemberRemove from './events/logs/guildMemberRemove';
Kwako.on('guildMemberRemove', async member => {
    if (!member.guild.available) return;

    let guildDB = `exp.${member.guild.id.toString()}`
    await Kwako.db.collection('user').updateOne({ _id: member.id }, { $mul: { [guildDB]: -1 } });

    let guildConf = await Kwako.getGuildConf(member.guild.id);

    let modLogChannel = guildConf.modLogChannel;
    if (!modLogChannel) return;

    return guildMemberRemove(member, modLogChannel);
});

import guildBanAdd from './events/logs/guildBanAdd';
import utilities from "./utils/utilities";
Kwako.on('guildBanAdd', async (guild, user) => {
    if (!guild.available) return;

    let guildDB = `exp.${guild.id.toString()}`
    await Kwako.db.collection('user').updateOne({ _id: user.id }, { $unset: { [guildDB]: 0 } });

    let guildConf = await Kwako.getGuildConf(guild.id);

    let modLogChannel = guildConf.modLogChannel;
    if (!modLogChannel) return;

    return guildBanAdd(guild, user, modLogChannel);
});

// VC Check if Kwako's alone
Kwako.on('voiceStateUpdate', async (oldState, newState) => {
    let channel = oldState.channel;
    if (!channel) return;

    if (oldState.id === Kwako.user.id && newState.id === Kwako.user.id) {
        if (!newState.channel) {
            let player = Kwako.music.players.get(oldState.guild.id);

            if (player)
                player.destroy();
        }
    }

    let members = channel.members;
    if (members.size === 1)
        if (members.has(Kwako.user.id)) {
            let voiceChannel = oldState.channel;
            if (!voiceChannel) return;

            const player = Kwako.music.players.get(voiceChannel.guild.id);

            if (player) {
                setTimeout(async () => {
                    let voiceChan = await Kwako.channels.fetch(player.voiceChannel);
                    if (!voiceChan) return player.destroy();

                    if ((voiceChan as VoiceChannel).members.size === 1) {
                        player.destroy();
                        Kwako.log.info({ msg: 'auto stop', guild: { id: voiceChannel.guild.id, name: voiceChannel.guild.name } })
                    }
                }, 60000);
            }
        }
});

Kwako.on('channelCreate', async channel => {
    if (channel.type === 'dm' || channel.type === 'group') return;

    let guildConf = await Kwako.getGuildConf((channel as GuildChannel).guild.id)

    if (guildConf.muteRole) {
        await (channel as GuildChannel).updateOverwrite(guildConf.muteRole, {
            'SEND_MESSAGES': false,
            'ADD_REACTIONS': false,
            'CONNECT': false,
            'SPEAK': false
        });
    }
});
// todo: add a loop to verify every channels

// Check if it's someone's birthday, and send a HBP message at 8am UTC
import birthdayCheck from './events/birthdayCheck';
import makePermsErrorBetter from "./utils/makePermsErrorBetter";
setInterval(async () => {
    await birthdayCheck()
}, 3600000);

// unmute loop
setInterval(async () => {
    let now = Date.now();
    let users = await Kwako.db.collection('mute').find().toArray();

    for (const user of users) {
        if (user.until) {

            for (const [key, val] of Object.entries(user.until)) {
                if (val <= now) {
                    let guild = await Kwako.db.collection('guilds').findOne({ '_id': { $eq: key } });
                    if (!guild) return;

                    let guildConf = await Kwako.getGuildConf(guild._id);
                    if (!guildConf.muteRole) return;

                    let discGuild = await Kwako.guilds.fetch(key);
                    if (!discGuild) return;

                    let discMember = await discGuild.members.fetch(user._id);
                    if (!discMember) return;

                    await discMember.roles.remove(guildConf.muteRole).catch(() => { return });
                    await Kwako.db.collection('mute').deleteOne({ _id: user._id });
                }
            }

        } else {
            await Kwako.db.collection('mute').deleteOne({ _id: user._id });
        }
    }

}, 30000);

// Login
Kwako.start(process.env.TOKEN);