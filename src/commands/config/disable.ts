import { Client, Message, Collection } from 'discord.js';
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, commands: Collection<any, any>, guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA || process.env.SUDO == '0')) return;
    if (args.length != 1) return;

    let disabled: string[] = guildConf.disabledCommands || [];

    let cmd: any = commands.get(args[0]) || commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(args[0]));
    if (!cmd) return;

    disabled.push(cmd.help.name);
    if(cmd.help.aliases) {
        for(const alias of cmd.help.aliases) {
            disabled.push(alias)
        }
    }

    guildConf.disabledCommands = disabled;

    await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { config: guildConf }});

    return msg.channel.send({
        "embed": {
          "title": ":no_entry: Command disabled",
          "description": `The command \`${cmd.help.name}\` has been successfully disabled`
        }
      })
};

module.exports.help = {
    name: 'disable',
    usage: "disable (name of the command)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};