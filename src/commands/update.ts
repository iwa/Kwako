import { Client, Message } from 'discord.js'

module.exports.run = async (bot: Client, msg: Message, args: string[]) => {
    if (msg.author.id !== process.env.IWA) return;

    let min = 30;
    if(args[0])
        min = parseInt(args[0]);

    await bot.user.setActivity(`⚠️ update in ${min}min`, { type: 'LISTENING' }).catch(console.error);
    await bot.user.setStatus('idle').catch(console.error);

    setInterval(async () => {
        if(min > 1) {
            min -= 1;
            await bot.user.setActivity(`⚠️ update in ${min}min`, { type: 'LISTENING' }).catch(console.error);
        } else {
            await bot.user.setActivity(`⚠️ update soon...`, { type: 'LISTENING' }).catch(console.error);
        }
    }, 60000);
};

module.exports.help = {
    name: 'update'
};