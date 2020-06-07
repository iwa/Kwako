import { Client, Message } from 'discord.js';
import { Db } from 'mongodb';

module.exports.run = async (bot: Client, msg: Message, args:string[], db:Db, settings:any) => {
    if(!msg.member.hasPermission('MANAGE_GUILD'))
        return msg.delete();

    const [prop, ...value] = args;

    if(!settings.has(msg.guild.id, prop))
        return msg.reply("This key is not in the configuration.");

    let clearValue = value.join(" ");

    if(prop.includes('Channel')) {
        let channel = args[args.length - 1];
        if(channel.startsWith('<#') && channel.endsWith('>')) {
            channel = channel.slice(2, (channel.length-1))
            let chan = msg.guild.channels.resolve(channel);
            if(chan && chan.type == 'text' && chan.viewable)
                clearValue = channel;
            else
                return msg.reply("there's a problem with this channel!")
        } else
            return msg.reply('please')
    }

    settings.set(msg.guild.id, clearValue, prop);

    msg.channel.send(`\`${prop}\` has been changed to: **${value.join(" ")}**`);
};

module.exports.help = {
    name: 'setconf',
    usage: "setconf (property) (value)",
    desc: "Set a custom configuration for this Guild"
};