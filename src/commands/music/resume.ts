import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.resume(bot, msg);
};

module.exports.help = {
    name: 'resume',
    usage: "resume",
    desc: "Resume paused music"
};