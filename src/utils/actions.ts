/**
 * Actions function
 * @packageDocumentation
 * @module Actions
 * @category Utils
 */
import Kwako from '../Client'
import { Guild, Message, MessageEmbed, User } from 'discord.js';
import utilities from './utilities'

/** @desc Automatic replies of the bot when an action is done on it  */
let reply = ["awww", "thank you :33", "damn you're so precious", "why are you so cute with me ?", "omg", "<3", "so cuuuute c:", "c:", "c;", ":3", "QT af :O", "^u^ thanks!", ">u<"]

/**
 * define last gif of action.
 * as the gif '0' doesn't exist, the first one will be random
 */
let lastGif = new Map([
    ['pat', 0],
    ['hug', 0],
    ['group-hug', 0],
    ['boop', 0],
    ['slap', 0],
    ['squish', 0],
    ['glare', 0],
    ['tickle', 0],
    ['kiss', 0],
    ['yeet', 0],
    ['cuddle', 0],
    ['tongueout', 0]
]);

/** define the number of gifs available */
let count = new Map([
    ['pat', 46],
    ['hug', 51],
    ['group-hug', 9],
    ['boop', 15],
    ['slap', 11],
    ['squish', 4],
    ['glare', 6],
    ['tickle', 5],
    ['kiss', 9],
    ['yeet', 3],
    ['cuddle', 7],
    ['tongueout', 9]
]);

export default async function actionsRun(msg: Message, args: string[], type: string, verb: string, at: boolean) {
    if (args.length === 0) return;
    if (args.length <= 5 && msg.mentions.members.size <= 5) {
        if (msg.mentions.everyone) return;
        if (msg.mentions.members.has(msg.author.id)) {
            if (type === 'slap')
                return msg.channel.send({ "embed": { "title": `**Don't ${type} yourself! It's mean! :c**`, "color": 13632027 }});
            msg.channel.send({ "embed": { "title": `**Don't ${type} yourself! Lemme do it for you...**`, "color": 13632027 }});
            const embed = new MessageEmbed();
            embed.setColor('#F2DEB0')
            embed.setDescription(`<@${Kwako.user.id}> ${verb}${at ? ' at' : ''} you <@${msg.author.id}>!`)

            let n = utilities.randomInt(count.get(type))
            while (lastGif.get(type) === n)
                n = utilities.randomInt(count.get(type));
            lastGif.set(type, n);

            embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
            return msg.channel.send(embed)
                .then(() => { Kwako.log.info({msg: type, cmd: type, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }}); })
                .catch(Kwako.log.error);
        }

        if (msg.mentions.members.has(Kwako.user.id) && !['slap', 'glare'].includes(type)) {
            let r = utilities.randomInt(reply.length)
            setTimeout(() => {
                msg.reply(reply[r-1]);
            }, 2000)
        }

        const embed = new MessageEmbed();
        embed.setColor('#F2DEB0')
        if (msg.mentions.members.size >= 2) {
            let users = msg.mentions.members.array()
            let title: string = `<@${msg.author.id}> ${verb}${at ? ' at' : ''} you <@${users[0].id}>`;
            for (let i = 1; i < (msg.mentions.members.size - 1); i++)
                title = `${title}, <@${users[i].id}>`
            title = `${title} & <@${(msg.mentions.members.last()).id}>!`
            embed.setDescription(title);

            if (type == 'hug') {
                let groupType = `group-${type}`
                let n = utilities.randomInt(count.get(groupType))
                while (lastGif.get(groupType) === n)
                    n = utilities.randomInt(count.get(groupType));
                lastGif.set(groupType, n);

                embed.setImage(`https://${process.env.CDN_URL}/img/${type}/group/${n}.gif`)
            } else {
                let n = utilities.randomInt(count.get(type))
                while (lastGif.get(type) === n)
                    n = utilities.randomInt(count.get(type));
                lastGif.set(type, n);

                embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
            }
        } else if (msg.mentions.members.size === 1) {
            let target = msg.mentions.users.first();
            if(!msg.author || !target) return;
            embed.setDescription(`<@${msg.author.id}> ${verb}${at ? ' at' : ''} you <@${target.id}>!`)

            let n = utilities.randomInt(count.get(type))
            while (lastGif.get(type) === n)
                n = utilities.randomInt(count.get(type));
            lastGif.set(type, n);

            embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
        } else {
            let target = args.join(' ');
            let user = msg.guild.members.cache.find(member => member.user.username.toLowerCase() === target.toLowerCase());

            if(!msg.author || !user) return;
            embed.setDescription(`<@${msg.author.id}> ${verb}${at ? ' at' : ''} you <@${user.id}>!`)

            let n = utilities.randomInt(count.get(type))
            while (lastGif.get(type) === n)
                n = utilities.randomInt(count.get(type));
            lastGif.set(type, n);

            embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)
        }

        let guild = `${type}.${msg.guild.id.toString()}`
        let user = await Kwako.db.collection('user').findOne({ '_id': { $eq: msg.author.id } });

        let nb = 0;
        if(user)
            if(user[type]) {
                nb = user[type][msg.guild.id] || 0;
                if(nb < 0) {
                    nb *= -1;
                    await Kwako.db.collection('user').updateOne({ '_id': { $eq: msg.author.id } }, { $mul: { [guild]: -1 }});
                }
            }

        await Kwako.db.collection('user').updateOne({ '_id': { $eq: msg.author.id } }, { $inc: { [guild]: msg.mentions.members.size } }, { upsert: true });

        embed.setFooter(`You have given ${nb + msg.mentions.members.size} ${verb}`)

        return msg.channel.send(embed)
            .then(async (sent) => {
                let target = msg.mentions.users.first() || Kwako.users.cache.find(user => user.username.toLowerCase() === args.join(' ').toLowerCase());
                if(target.bot) return;
                let reaction = await sent.react('<:noU:769888137378922516>');
                let collected = await sent.awaitReactions((_reaction, user) => _reaction.emoji.identifier === reaction.emoji.identifier && user.id === target.id, { max: 1, time: 30000 });
                reaction.remove();
                if(collected.first()) {
                    let embed = await actionsRunBack(target, msg.author, msg.guild, type, verb, at);
                    await msg.channel.send(embed);
                }

                Kwako.log.info({msg: type, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
            })
            .catch(Kwako.log.error);
    } else {
        await msg.delete().catch(() => {return});
        return msg.channel.send(`<@${msg.author.id}>`, {'embed':{
            'title': 'To avoid mass mentions, your message has been deleted',
            'description': 'Please be careful and keep mentions under 5'
        }})
    }
}

async function actionsRunBack(author: User, target: User, guild: Guild, type: string, verb: string, at: boolean) {
    let embed = new MessageEmbed();
    embed.setColor('#F2DEB0')

    if(!author || !target) return;

    embed.setDescription(`<@${author.id}> ${verb}${at ? ' at' : ''} you back <@${target.id}>!`)

    let n = utilities.randomInt(count.get(type))
    while (lastGif.get(type) === n)
        n = utilities.randomInt(count.get(type));
    lastGif.set(type, n);

    embed.setImage(`https://${process.env.CDN_URL}/img/${type}/${n}.gif`)

    let guildStr = `${type}.${guild.id.toString()}`
    let user = await Kwako.db.collection('user').findOne({ '_id': { $eq: author.id } });

    let nb = 0;
    if(user)
        if(user[type]) {
            nb = user[type][guild.id] || 0;
            if(nb < 0) {
                nb *= -1;
                await Kwako.db.collection('user').updateOne({ '_id': { $eq: author.id } }, { $mul: { [guildStr]: -1 }});
            }
        }

    await Kwako.db.collection('user').updateOne({ '_id': { $eq: author.id } }, { $inc: { [guildStr]: 1 } }, { upsert: true });

    embed.setFooter(`You have given ${nb + 1} ${verb}`)

    Kwako.log.info({msg: type, author: { id: author.id, name: author.tag }, guild: { id: guild.id, name: guild.name }});

    return embed;
}
