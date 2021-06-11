import Kwako from '../Client';
import { Message, MessageEmbed } from "discord.js";

let talkedRecently = new Set();

export default async function message(msg: Message) {
    if (!msg) return;
    if (msg.author.bot) return;
    if (!msg.guild) return Kwako.log.trace({ msg: 'dm', author: { id: msg.author.id, name: msg.author.tag }, content: msg.cleanContent, attachment: msg.attachments.first() });
    if (msg.channel.type !== "text") return;

    //let guildConf = await Kwako.getGuildConf(msg.guild.id);
    //let disabled: string[] = guildConf.disabledCommands || [];

    //await cooldown.message(msg, guildConf);

    //if (msg.channel.id === guildConf.suggestionChannel)
    //    return suggestion(msg, Kwako.patrons.has(msg.guild.ownerID));

    if (!msg.content.startsWith(Kwako.prefix)) {
        if (msg.mentions.has(Kwako.user.id) && !msg.mentions.everyone)
            return msg.channel.send({
                'embed': {
                    'description': `My prefix is \`${Kwako.prefix}\``
                }
            })

        //if (guildConf.useExpSystem)
        //    return cooldown.exp(msg, guildConf);

        return;
    }

    let args = msg.content.slice(1).trim().split(/ +/g);
    let req = args.shift().toLowerCase();
    let cmd: any = Kwako.commands.get(req) || Kwako.commands.find((comd) => comd.help.aliases && comd.help.aliases.includes(req));

    if (talkedRecently.has(msg.author.id)) {
        const embed = new MessageEmbed()
            .setTitle('⌛ Command Cooldown')
            .setColor('#e67e22')
            .setDescription(`${msg.author}, please wait 3s before sending your next command!`);
        let sent = await msg.channel.send(embed);
        return setTimeout(async () => { await sent.delete(); }, 3000);
    }

    //if (!cmd || disabled.includes(cmd.help.name)) return;
    if (cmd) {
        if (cmd.help.premium && !Kwako.patrons.has(msg.guild.ownerID))
            return msg.channel.send({
                "embed": {
                    "title": "❌ Sorry, but this feature is premium-only.",
                    "description": "[Become a Patron](https://www.patreon.com/iwa) in order to access the new features before everyone else!",
                    "color": 13901365
                }
            }).catch(() => { return; });

        //if (cmd.help.perms && !msg.guild.me.hasPermission(cmd.help.perms))
        //    return makePermsErrorBetter(msg, cmd);

        if (!msg.member.hasPermission('MANAGE_GUILD')) {
            talkedRecently.add(msg.author.id);
            setTimeout(() => {
                talkedRecently.delete(msg.author.id);
            }, 3000);
        }

        Kwako.log.trace({ msg: msg.cleanContent, author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } });
        await cmd.run(msg, args);
    }
}