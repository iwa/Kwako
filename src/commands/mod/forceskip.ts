import { Client, Message } from 'discord.js'
import music from '../../utils/music'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: any, db: any, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    music.forceskip(bot, msg, log);
};

module.exports.help = {
    name: 'forceskip',
    usage: 'forceskip',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'CONNECT', 'SPEAK', 'USE_VAD', 'ADD_REACTIONS']
};