import { Client, Message } from 'discord.js'
import utilities from '../../utils/utilities'

module.exports.run = (bot: Client, msg: Message, args: string[]) => {
    if (args.length > 0) {
        let x = args[0]
        msg.channel.send({
            "embed": {
                "title": `🎲 **${utilities.randomInt(parseInt(x))}**`,
                "color": 5601658
            }
        })
            .then(() => { console.log(`info: roll (${x}) by ${msg.author.tag}`) })
            .catch(console.error);
    } else {
        msg.channel.send({
            "embed": {
                "title": `🎲 **${utilities.randomInt(100)}**`,
                "color": 5601658
            }
        })
            .then(() => { console.log(`info: roll (100) by ${msg.author.tag}`) })
            .catch(console.error);
    }
};

module.exports.help = {
    name: 'roll',
    usage: "roll [number]",
    desc: "Generates a number between 1 and the number you choose.\n_Rolls up to 100 if a number isn't provided._"
};