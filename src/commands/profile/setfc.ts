import Kwako from '../../Client'
import { Message, MessageEmbed } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if (args.length !== 1) return msg.channel.send({
        "embed": {
          "description": `\`${guildConf.prefix}setfc (Switch Friend Code)\` to register your FC in your profile card\n\n\`${guildConf.prefix}setfc off\` to remove it`,
          "color": 11462520
        }
      })

    let content = args[0]

    if (content === 'off') {
        await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, { $set: { fc: null }}, { upsert: true });
        if (msg.deletable) {
            try {
                await msg.delete()
            } catch (ex) {
                Kwako.log.error(ex)
            }
        }
        Kwako.log.info({msg: 'setfc', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, fc: 'off'});
        return msg.channel.send({
            "embed": {
              "author": {
                "name": "✅ Your Switch Friend Code has been deleted",
                "icon_url": msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 })
              },
              "color": 2270600
            }
        })
    }

    if (content.length != 14 || content.search(/\d\d\d\d-\d\d\d\d-\d\d\d\d/gi) == -1) {
        return msg.channel.send({ "embed": { "title": ":x: > **Switch Friend Code format invalid!** Please enter your FC without the 'SW-' at the beginning", "color": 13632027 } });
    }

    await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, { $set: { fc: content } }, { upsert: true });
    const embed = new MessageEmbed();
    embed.setAuthor("Your Switch FC is now set to : ", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
    embed.setTitle(`**${content}**`)
    embed.setColor('AQUA')
    try {
        Kwako.log.info({msg: 'setfc', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, fc: content});
        return msg.channel.send(embed);
    } catch (err) {
        Kwako.log.error(err);
    }
};

module.exports.help = {
    name: 'setfc',
    aliases: ['setfriendcode'],
    usage: "setfc (your Switch FC)",
    desc: "Register your Switch Friend Code to Kwako.\nPlease enter your FC without 'SW-' at the beginning"
};