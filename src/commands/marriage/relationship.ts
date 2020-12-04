import Kwako from '../../Client'
import { Message } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    let married: string = null;
    let user = await Kwako.db.collection('user').findOne({ _id: msg.author.id });
    if(user)
        if(user.marriage)
            if(user.marriage[msg.guild.id])
                married = user.marriage[msg.guild.id]

    if(married) {
        let target = await Kwako.users.fetch(married);
        return msg.channel.send({'embed':{
            'title': `👥 You're currently engaged with ${target.username}`
        }});
    } else return msg.channel.send({'embed':{
        'title': "👤 You're alone"
    }});
};

module.exports.help = {
    name: 'relationship',
    aliases: ['rs'],
    usage: "relationship (@user)",
    desc: "See your current relationship",
    premium: true
};