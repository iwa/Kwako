import { Client, Message } from 'discord.js'
import utilities from '../../utils/utilities'
import { Logger } from 'pino';

module.exports.run = (bot: Client, msg: Message, args: string[], db: any, log: Logger) => {
    if (args.length > 0) {
        let x = args[0]
        msg.channel.send({
            "embed": {
                "title": `🎲 **${utilities.randomInt(parseInt(x))}**`,
                "color": 5601658
            }
        })
            .then(() => { log.info({msg: 'roll', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, x: x}) })
            .catch(log.error);
    } else {
        msg.channel.send({
            "embed": {
                "title": `🎲 **${utilities.randomInt(100)}**`,
                "color": 5601658
            }
        })
            .then(() => { log.info({msg: 'roll', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, x: 100}) })
            .catch(log.error);
    }
};

module.exports.help = {
    name: 'roll',
    usage: "roll [number]",
    desc: "Generates a number between 1 and the number you choose.\n_Rolls up to 100 if a number isn't provided._",
    perms: ['EMBED_LINKS']
};