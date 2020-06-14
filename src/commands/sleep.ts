import { Client, Message } from 'discord.js'
import staff from '../utils/staff';

module.exports.run = (bot: Client, msg: Message) => {
    staff.sleep(bot, msg);
};

module.exports.help = {
    name: 'sleep'
};