import { Client, Message } from 'discord.js'
import utilities from '../../utils/utilities'

module.exports.run = async (bot: Client, msg: Message) => {
    let iwa = await bot.users.fetch(process.env.IWA);
    let avatar = iwa.avatarURL({ format: 'png', dynamic: false, size: 256 })
    utilities.info(msg, avatar)
};

module.exports.help = {
    name: 'info',
    usage: "info",
    desc: "Show some info about Kwako"
};
