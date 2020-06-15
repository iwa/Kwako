import { Client, Message } from 'discord.js'
const music = require('../../utils/music')

module.exports.run = (bot: Client, msg: Message) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;
    music.forceskip(bot, msg);
};

module.exports.help = {
    name: 'forceskip',
    usage: 'forceskip',
    staff: true
};