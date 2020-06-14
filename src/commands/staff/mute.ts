import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    staff.mute(bot, msg, args);
};

module.exports.help = {
    name: 'mute'
};