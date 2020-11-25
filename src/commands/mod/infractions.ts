import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) return;

    if (args.length === 1 && msg.channel.type !== 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === Kwako.user.id) return;

        let infractions = await Kwako.db.collection('infractions').find({ target: mention.id, guild: msg.guild.id }).toArray();

        let infractionText = "";
        for(const infra of infractions) {
            let author = await Kwako.users.fetch(infra.author);
            let date = new Date(infra.date);
            infractionText = `${infractionText}**${infra.type}** - ${date.toLocaleString('en-GB', { timeZone: 'UTC' })} - by ${author.username}\n${infra.reason}\n\n`;
        }

        const embed = new MessageEmbed()
            .setAuthor(`${mention.user.username}'s infractions`, mention.user.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setDescription(infractionText);

        try {
            await msg.channel.send(embed);
        } catch (err) {
            return;
        }

        Kwako.log.info({msg: 'infractions', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, target: { id: mention.id, name: mention.user.tag }})
    }
};

module.exports.help = {
    name: 'infractions',
    aliases: ['infraction'],
    usage: 'infractions (mention someone)',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
}