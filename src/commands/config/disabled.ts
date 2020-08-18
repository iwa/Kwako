import Kwako from '../../Client';
import { Message, MessageEmbed } from 'discord.js';

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    let disabled: string[] = guildConf.disabledCommands || [];

    let embed = new MessageEmbed();
    embed.setTitle("Disabled commands");
    embed.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true, size: 128 }));

    let desc = "";

    for(const command of disabled) {
        desc = `${desc}\`${command}\`, `
    }

    embed.setDescription(desc)

    await msg.channel.send(embed)

    Kwako.log.info({msg: 'disabled', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'disabled',
    usage: "disabled",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};