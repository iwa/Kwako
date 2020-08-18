import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (msg: Message) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;
    music.forceskip(msg);
};

module.exports.help = {
    name: 'forceskip',
    usage: 'forceskip',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};