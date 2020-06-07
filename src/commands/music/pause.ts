import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.pause(bot, msg);
};

module.exports.help = {
    name: 'pause',
    usage: "pause",
    desc: "Pause the currently played song"
};