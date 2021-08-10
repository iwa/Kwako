import Kwako from '../Client';
import { Message, MessageEmbed } from "discord.js";
import Command from '../structures/Command';

let talkedRecently = new Set();

export default async function message(msg: Message) {
    if (!msg) return;
    if (msg.author.bot) return;
    if (!msg.guild) return Kwako.log.trace({ msg: 'dm', author: { id: msg.author.id, name: msg.author.tag }, content: msg.cleanContent, attachment: msg.attachments.first() });
    if (msg.channel.type !== "GUILD_TEXT") return;

    //let guildConf = await Kwako.getGuildConf(msg.guild.id);
    //let disabled: string[] = guildConf.disabledCommands || [];

    //await cooldown.message(msg, guildConf);

    //if (msg.channel.id === guildConf.suggestionChannel)
    //    return suggestion(msg, Kwako.patrons.has(msg.guild.ownerID));

    if (!msg.content.startsWith(Kwako.prefix)) {
        if (msg.mentions.has(Kwako.user.id) && !msg.mentions.everyone)
            return msg.channel.send({
                'embeds': [{
                    'description': Kwako.getText(msg.guild.id, 'showPrefix', Kwako.prefix)
                }]
            })

        //if (guildConf.useExpSystem)
        //    return cooldown.exp(msg, guildConf);

        return;
    }

    let args = msg.content.slice(2).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: Command = Kwako.commands.get(req) || Kwako.commands.find((comd) => comd.aliases && comd.aliases.includes(req));

    if (talkedRecently.has(msg.author.id)) {
        const embed = new MessageEmbed()
            .setTitle(Kwako.getText(msg.guild.id, 'cmdCooldownEmbedTitle'))
            .setDescription(Kwako.getText(msg.guild.id, 'cmdCooldownEmbedDesc', msg.author.username))
            .setColor('#e67e22');

        let sent = await msg.channel.send({ embeds: [embed] });
        return setTimeout(async () => { await sent.delete(); }, 3000);
    }

    //if (!cmd || disabled.includes(cmd.help.name)) return;
    if (cmd) {
        if (cmd.premium && !Kwako.patrons.has(msg.guild.ownerId))
            return msg.channel.send({
                "embeds": [{
                    "title": Kwako.getText(msg.guild.id, 'premiumRequiredEmbedTitle'),
                    "description": Kwako.getText(msg.guild.id, 'premiumRequiredEmbedDesc'),
                    "color": 13901365
                }]
            }).catch(() => { return; });

        //if (cmd.help.perms && !msg.guild.me.hasPermission(cmd.help.perms))
        //    return makePermsErrorBetter(msg, cmd);

        if (!msg.member.permissions.has('MANAGE_GUILD')) {
            talkedRecently.add(msg.author.id);
            setTimeout(() => {
                talkedRecently.delete(msg.author.id);
            }, 3000);
        }

        Kwako.log.trace({ msg: msg.cleanContent, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } });
        await cmd.runMsg(msg, args);
    }
}