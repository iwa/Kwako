import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.stop(msg);
};

module.exports.help = {
    name: 'leave',
    usage: "leave",
    desc: "Make the bot stop playing music and disconnect it from the Qumu Radio"
};