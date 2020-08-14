import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: string[], db: any, log: Logger) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    staff.bulk(msg, args, log);
};

module.exports.help = {
    name: 'bulk',
    usage: 'bulk (number of messages to delete)',
    staff: true,
    perms: ['MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};