import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    music.np(msg, bot);
};

module.exports.help = {
    name: 'np',
    usage: "np",
    desc: "Show the currently playing song.\n(alias of ?nowplaying)"
};