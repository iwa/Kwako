import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';

module.exports.run = (bot: Client, msg: Message, args:string[], db:any, commands:any, guildConf:any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA && process.env.SUDO === '0')) return;

    if(!guildConf.muteRole) return msg.channel.send(":x: > You haven't configured any muted role!")

    staff.mute(bot, msg, args, guildConf.muteRole);
};

module.exports.help = {
    name: 'mute',
    usage: 'mute (mention someone) (length)',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};