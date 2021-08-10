import dotenv from "dotenv";
dotenv.config();

import Kwako from './Client';

import { MessageReaction, User, Message, MessageEmbed, TextChannel, Util, VoiceChannel, GuildChannel } from 'discord.js';
import ready from "./listeners/ready";
import message from "./listeners/message";
import interaction from "./listeners/interaction";
//import { Manager } from "erela.js";

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
});

Kwako.on('messageCreate', async (msg) => { message(msg); });
Kwako.on('interactionCreate', async (int) => { interaction(int); });

// Login
Kwako.start(process.env.TOKEN);