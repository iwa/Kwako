import { Client, Message } from 'discord.js'
import staff from '../utils/staff';

module.exports.run = async (bot: Client, msg: Message) => {
    if (msg.author.id != process.env.IWA) return;
    if(process.env.SUDO === '0') {
        process.env.SUDO = '1';
        await msg.react('✅');
    } else {
        process.env.SUDO = '0';
        await msg.react('⏹');
    }
};

module.exports.help = {
    name: 'sudo'
};