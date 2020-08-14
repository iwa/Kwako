import { Client, Message, Collection, MessageEmbed } from 'discord.js';
import { Db } from 'mongodb'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger, commands: Collection<any, any>, guildConf: any) => {
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

    log.info({msg: 'disabled', author: msg.author.id, guild: msg.guild.id})
};

module.exports.help = {
    name: 'disabled',
    usage: "disabled",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};