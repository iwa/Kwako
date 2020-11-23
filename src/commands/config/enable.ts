import Kwako from '../../Client';
import { Message } from 'discord.js';
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length !== 1) return;

    let disabled: string[] = guildConf.disabledCommands || [];

    let cmd: any = Kwako.commands.get(args[0]) || Kwako.commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(args[0]));
    if (!cmd) return;

    if(!disabled.includes(cmd.help.name))
        return msg.channel.send({'embed':{
            'title': ':x: This command has already been enabled'
        }})

    let filtered = disabled.filter((value) => { return value !== cmd.help.name });
    if (cmd.help.aliases)
        filtered = filtered.filter((value) => { return !cmd.help.aliases.includes(value) });

    guildConf.disabledCommands = filtered;

    await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { config: guildConf }});

    await msg.channel.send({
        "embed": {
          "title": ":white_check_mark: Command enabled",
          "description": `The command \`${cmd.help.name}\` has been successfully enabled`
        }
      })

    Kwako.log.info({msg: 'enable', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'enable',
    usage: "enable (name of the command)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};