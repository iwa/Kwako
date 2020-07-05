import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';

module.exports.run = (bot: Client, msg: Message, args:string[], db:any, commands:any, settings:Map<string, Object>) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA && process.env.SUDO === '0')) return;

    let config:any = settings.get(msg.guild.id);
    if(config.muteRole == null) return msg.channel.send(":x: > You haven't configured any muted role!")

    staff.mute(bot, msg, args, config.muteRole);
};

module.exports.help = {
    name: 'mute',
    usage: 'mute (mention someone) (length)',
    staff: true
};