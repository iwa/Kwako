import Kwako from '../Client';
import { Interaction, MessageEmbed } from "discord.js";
import Command from '../structures/Command';

let talkedRecently = new Set();

export default async function interaction(int: Interaction) {
    if (!int) return;
    if (int.user.bot) return;
    if (!int.isCommand()) return;
    if (!int.inGuild) return Kwako.log.trace({ msg: 'dm interact', author: { id: int.user.id, name: int.user.tag }, content: int.commandName });
    if (int.channel.type !== "GUILD_TEXT") return;

    //let guildConf = await Kwako.getGuildConf(msg.guild.id);
    //let disabled: string[] = guildConf.disabledCommands || [];

    //await cooldown.message(msg, guildConf);

    //if (msg.channel.id === guildConf.suggestionChannel)
    //    return suggestion(msg, Kwako.patrons.has(msg.guild.ownerID));

    //let args = msg.content.slice(1).trim().split(/ +/g);
    let req = int.commandName.toLowerCase();
    let cmd: Command = Kwako.commands.get(req) || Kwako.commands.find((comd) => comd.aliases && comd.aliases.includes(req));

    //if (talkedRecently.has(msg.author.id)) {
    //    const embed = new MessageEmbed()
    //        .setTitle(Kwako.getText(msg.guild.id, 'cmdCooldownEmbedTitle'))
    //        .setDescription(Kwako.getText(msg.guild.id, 'cmdCooldownEmbedDesc', msg.author.username))
    //        .setColor('#e67e22');
    //
    //    let sent = await msg.channel.send({ embeds: [embed] });
    //    return setTimeout(async () => { await sent.delete(); }, 3000);
    //}

    //if (!cmd || disabled.includes(cmd.help.name)) return;
    if (cmd) {
        if (cmd.premium && !Kwako.patrons.has(int.guild.ownerId))
            return int.reply({
                "embeds": [{
                    "title": Kwako.getText(int.guildId, 'premiumRequiredEmbedTitle'),
                    "description": Kwako.getText(int.guildId, 'premiumRequiredEmbedDesc'),
                    "color": 13901365
                }]
            }).catch(() => { return; });

        //if (cmd.help.perms && !msg.guild.me.hasPermission(cmd.help.perms))
        //    return makePermsErrorBetter(msg, cmd);

        //if (!msg.member.permissions.has('MANAGE_GUILD')) {
        //    talkedRecently.add(msg.author.id);
        //    setTimeout(() => {
        //        talkedRecently.delete(msg.author.id);
        //    }, 3000);
        //}

        //Kwako.log.trace({ msg: msg.cleanContent, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } });
        await cmd.runInteraction(int);
    }
}