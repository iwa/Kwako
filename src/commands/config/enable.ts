import { Client, Message, Collection } from 'discord.js';
import { Db } from 'mongodb'
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, log: Logger, commands: Collection<any, any>, guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;
    if (args.length != 1) return;

    let disabled: string[] = guildConf.disabledCommands || [];

    let cmd: any = commands.get(args[0]) || commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(args[0]));
    if (!cmd) return;

    let filtered = disabled.filter((value) => { return value != cmd.help.name });
    if (cmd.help.aliases)
        filtered = filtered.filter((value) => { return !cmd.help.aliases.includes(value) });

    guildConf.disabledCommands = filtered;

    await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { config: guildConf }});

    await msg.channel.send({
        "embed": {
          "title": ":white_check_mark: Command enabled",
          "description": `The command \`${cmd.help.name}\` has been successfully enabled`
        }
      })

    log.info({msg: 'enable', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'enable',
    usage: "enable (name of the command)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};