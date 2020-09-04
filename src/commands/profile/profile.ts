import Kwako from '../../Client'
import { Message } from 'discord.js'
import imGenerator from '../../utils/img';
import utilities from '../../utils/utilities'

module.exports.run = (msg: Message, args: string[]) => {
    if (args.length == 1) {
        if (msg.mentions.everyone) return;
        let mention = msg.mentions.users.first()
        if (!mention || mention.bot) return;
        return profileImg(msg, mention.id);
    } else
        return profileImg(msg, msg.author.id);
};

module.exports.help = {
    name: 'profile',
    aliases: ['me', 'rank'],
    usage: "profile [mention someone]",
    desc: "Print your or someone's profile",
    perms: ['SEND_MESSAGES', 'ATTACH_FILES']
};

async function profileImg(msg: Message, id: string) {
    let userDB = await Kwako.db.collection('user').findOne({ '_id': { $eq: id } });

    msg.channel.startTyping();

    let userDiscord = await Kwako.users.fetch(id)
    let memberDiscord = await msg.guild.members.fetch(id)

    if (!userDB || !userDB.exp) {
        let user = {
            avatar: userDiscord.avatarURL({ format: 'png', dynamic: false, size: 512 }) || userDiscord.defaultAvatarURL,
            username: userDiscord.username,
            positionExp: "?",
            level: 1,
            current: 0,
            max: 100,
            userColor: memberDiscord.displayHexColor,
            expBar: 0,
            birthday: "--/--",
            fc: "not registered"
        }

        if(user.userColor == '#000000') user.userColor = '#444444';
        let file = await imGenerator(user);

        try {
            Kwako.log.info({msg: 'profile', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: userDiscord.id, name: userDiscord.tag }});
            return msg.channel.send('', { files: [file] }).then(() => { msg.channel.stopTyping(true) });
        } catch (err) {
            Kwako.log.error(err)
            return msg.channel.send(":x: > An error occured. Please retry later.")
        }
    }

    let guild = `exp.${msg.guild.id.toString()}`
    let leadXP = await Kwako.db.collection('user').find().sort({ [guild]: -1 }).toArray();

    let lvlInfo = utilities.levelInfo(userDB.exp[msg.guild.id]);

    let user = {
        avatar: userDiscord.avatarURL({ format: 'png', dynamic: false, size: 512 }) || userDiscord.defaultAvatarURL,
        username: userDiscord.username,
        positionExp: (leadXP.findIndex(val => val._id == id) + 1),
        level: lvlInfo.level,
        current: lvlInfo.current,
        max: lvlInfo.max,
        userColor: memberDiscord.displayHexColor,
        userBackground: userDB.background,
        expBar: Math.round((lvlInfo.current / lvlInfo.max) * 646),
        birthday: userDB.birthday || "--/--",
        fc: userDB.fc || "not registered"
    }

    if(user.userColor == '#000000') user.userColor = '#444444';
    let file = await imGenerator(user);

    try {
        Kwako.log.info({msg: 'profile', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: userDiscord.id, name: userDiscord.tag }});
        return msg.channel.send('', { files: [file] }).then(() => { msg.channel.stopTyping(true) });
    } catch (err) {
        Kwako.log.error(err)
        return msg.channel.send(":x: > An error occured. Please retry later.")
    }
}