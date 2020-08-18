import Kwako from '../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message) => {
    if (msg.author.id !== process.env.IWA) return;

    if (process.env.SLEEP == '0') {
        await Kwako.user.setPresence({ activity: { name: "being updated...", type: 0 }, status: 'dnd' })
            .then(() => {
                msg.react("✅");
                console.log("info: sleeping enabled")
            })
            .catch(console.error);
        msg.channel.send("Sleeping Mode On!")
        return process.env.SLEEP = '1';
    } else {
        await Kwako.user.setPresence({ activity: { name: `with ${Kwako.guilds.cache.size} guilds`, type: 0 }, status: 'online' })
            .then(() => {
                msg.react("✅");
                console.log("info: sleeping disabled")
            })
            .catch(console.error);
        msg.channel.send("Sleeping Mode Off!")
        return process.env.SLEEP = '0';
    }
};

module.exports.help = {
    name: 'sleep'
};