import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.forceskip(bot, msg);
};

module.exports.help = {
    name: 'forceskip'
};