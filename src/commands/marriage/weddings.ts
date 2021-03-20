import Kwako from '../../Client'
import { Message } from 'discord.js'

module.exports.run = async (msg: Message) => {
    let guild = `marriage.${msg.guild.id}`
    let result = await Kwako.db.collection('user').find({ [guild]: { $exists: true } }).toArray();

    let done: Set<string> = new Set();
    let text = "";
    for(const user of result) {
        if(!done.has(user._id) && !done.has(user.marriage[msg.guild.id])) {
            let first = await msg.guild.members.fetch(user._id).catch(() => {return});
            let second = await msg.guild.members.fetch(user.marriage[msg.guild.id]).catch(() => {return});

            if(!first || !second) {
                await Kwako.db.collection('user').updateOne({ _id: user._id }, { $unset: { [guild]: "" } });
                await Kwako.db.collection('user').updateOne({ _id: user.marriage[msg.guild.id] }, { $unset: { [guild]: "" } });
                return;
            }

            text = `${text}${first.user.username} 💞 ${second.user.username}\n`;
            done.add(first.id); done.add(second.id);
        }
    }

    await msg.channel.send({'embed':{
        "author": {
            "name": `Marriages in ${msg.guild.name}`,
            "icon_url": msg.guild.iconURL({ dynamic: true, size: 128 })
        },
        "description": text
    }})
};

module.exports.help = {
    name: 'weddings',
    aliases: ['marriages'],
    usage: "weddings",
    desc: "See all the mariages in the server",
    premium: true
};