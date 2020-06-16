/**
 * Actions function
 * @packageDocumentation
 * @module Actions
 * @category Utils
 */
import { Client, Message, MessageEmbed } from 'discord.js';
import { Db } from 'mongodb';
import utilities from './utilities'

/** @desc Automatic replies of the bot when an action is done on it  */
let reply = ["awww", "thank you :33", "damn you're so precious", "why are you so cute with me ?", "omg", "<3", "so cuuuute c:", "c:", "c;", ":3", "QT af :O", "^u^ thanks!", ">u<", "-u-"]

interface stringKeyArray {
    [index: string]: any;
}

/**
 * define last gif of action.
 * as the gif '0' doesn't exist, the first one will be random
 */
let lastGif: stringKeyArray = {
    'pat': 0,
    'hug': 0,
    'group-hug': 0,
    'boop': 0,
    'slap': 0
};

/** define the number of gifs available */
let count: stringKeyArray = {
    'pat': 46,
    'hug': 47,
    'group-hug': 9,
    'boop': 15,
    'slap': 9
};

/**
 * @param bot - Discord Client object
 * @param msg - Message object
 * @param args - Arguments in the message
 * @param db - Database connection object
 * @param type - Type of actions (hug, pat...)
 */
export default async function actionsRun(bot: Client, msg: Message, args: string[], db: Db, type: string) {
    if (args.length <= 4) {
        if (msg.mentions.everyone) return;
        if (msg.mentions.members.has(msg.author.id)) {
            msg.channel.send({ "embed": { "title": `**Don't ${type} yourself! Lemme do it for you...**`, "color": 13632027 }});
            const embed = new MessageEmbed();
            embed.setColor('#F2DEB0')
            embed.setDescription(`<@${bot.user.id}> ${type}s you <@${msg.author.id}>!`)

            let n = utilities.randomInt(count[type])
            while (lastGif[type] == n)
                n = utilities.randomInt(count[type]);
            lastGif[type] = n;

            embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
            return msg.channel.send(embed)
                .then(() => { console.log(`info: ${type} sent by ${msg.author.tag}`); })
                .catch(console.error);
        }

        if (msg.mentions.members.has(bot.user.id) && type != 'slap') {
            let r = utilities.randomInt(reply.length)
            setTimeout(() => {
                r - 1;
                msg.reply(reply[r]);
            }, 2000)
        }

        const embed = new MessageEmbed();
        embed.setColor('#F2DEB0')
        if (msg.mentions.members.size >= 2) {
            let users = msg.mentions.members.array()
            let title: string = `<@${msg.author.id}> ${type}s you <@${users[0].id}>`;
            for (let i = 1; i < (msg.mentions.members.size - 1); i++)
                title = `${title}, <@${users[i].id}>`
            title = `${title} & <@${(msg.mentions.members.last()).id}>!`
            embed.setDescription(title);

            if (type == 'hug') {
                let groupType = `group-${type}`
                let n = utilities.randomInt(count[groupType])
                while (lastGif[groupType] == n)
                    n = utilities.randomInt(count[groupType]);
                lastGif[groupType] = n;

                embed.setImage(`https://${process.env.CDN_URL}/img/${type}/group/${n}.gif`)
            } else {
                let n = utilities.randomInt(count[type])
                while (lastGif[type] == n)
                    n = utilities.randomInt(count[type]);
                lastGif[type] = n;

                embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
            }
        } else {
            embed.setDescription(`<@${msg.author.id}> ${type}s you <@${(msg.mentions.members.first()).id}>!`)

            let n = utilities.randomInt(count[type])
            while (lastGif[type] == n)
                n = utilities.randomInt(count[type]);
            lastGif[type] = n;

            embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
        }

        return msg.channel.send(embed)
            .then(() => {
                console.log(`info: ${type} sent by ${msg.author.tag}`);
            })
            .catch(console.error);

    }
}
