import Kwako from '../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if (msg.author.id !== process.env.IWA) return;

    let min = 30;
    if(args[0])
        min = parseInt(args[0]);

    await Kwako.user.setActivity(`⚠️ update in ${min}min`, { type: 'LISTENING' }).catch(Kwako.log.error);
    await Kwako.user.setStatus('idle').catch(Kwako.log.error);

    setInterval(async () => {
        if(min > 1) {
            min -= 1;
            await Kwako.user.setActivity(`⚠️ update in ${min}min`, { type: 'LISTENING' }).catch(Kwako.log.error);
        } else {
            await Kwako.user.setActivity(`⚠️ update soon...`, { type: 'LISTENING' }).catch(Kwako.log.error);
        }
    }, 60000);
};

module.exports.help = {
    name: 'update'
};