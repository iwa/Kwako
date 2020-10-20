import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
//const timespan = require("timespan-parser")("min");
import timespan from '../../utils/timespan';

module.exports.run = async (msg: Message, args:string[], guildConf:any) => {
    if (!msg.member.hasPermission('MANAGE_GUILD')) return;

    let muteRole = guildConf.muteRole;
    if(!muteRole) {
        await msg.member.guild.roles.create({
            data: {
                name: "Muted",
                color: "#5a5a5a",
                permissions: []
            }
        }).then(async role => {
            msg.member.guild.channels.cache.forEach(async (channel) => {
                await channel.createOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false, CONNECT: false, SPEAK: false })
                .catch(() => {return});
            });
            muteRole = role.id;
            await Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.muteRole']: role.id } });
        })
        await msg.channel.send({'embed':{
            'title': "🛠 A 'Muted' role has been generated."
        }});
    }

    let modLogChannel = guildConf.modLogChannel;

    mute(msg, args, muteRole, modLogChannel);
};

module.exports.help = {
    name: 'mute',
    usage: 'mute (mention someone) (length)',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};

async function mute(msg: Message, args: string[], muteRole: string, modLogChannel: string): Promise<void> {
    if (args.length >= 2 && msg.channel.type != 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === msg.author.id || mention.id === Kwako.user.id) return;

        if (msg.author.id != process.env.IWA && mention.hasPermission('MANAGE_GUILD')) return;

        try {
            msg.delete();
        } catch (error) {
            Kwako.log.error(error);
        }

        args.shift();
        let timeParsed = await timespan.parse(args[0], "msec", msg).catch(() => {return;});
        if(!timeParsed || typeof timeParsed !== 'number') return;

        let timeParsedString = await timespan.getString(timeParsed, "msec", msg);
        if(!timeParsedString || typeof timeParsedString !== 'string') return;

        args.shift();
        let reason = "no reason provided";
        if(args.length > 1)
            reason = args.join(" ")

        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle(`:octagonal_sign: **${mention.user.username}**, you've been muted for \`${timeParsedString}\` by **${msg.author.username}**`)

        try {
            let res = await mention.roles.add(muteRole).catch(async () => {
                    await msg.channel.send({'embed':{
                        'title': ":x: I can't mute people!",
                        'description': "Please make sure the 'Muted' role is below my highest role."
                    }});
                });

            if(res) {
                let reply = await msg.channel.send(embed)

                Kwako.log.info({msg: 'mute', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})

                if(modLogChannel) {
                    let channel = await Kwako.channels.fetch(modLogChannel);
                    let embedLog = new MessageEmbed();
                    embedLog.setTitle("Member muted");
                    embedLog.setDescription(`**Who:** ${mention.user.tag} (<@${mention.id}>)\n**By:** <@${msg.author.id}>\n**For:** \`${timeParsedString}\`\n**Reason:** \`${reason}\``);
                    embedLog.setColor(9392322);
                    embedLog.setTimestamp(msg.createdTimestamp);
                    embedLog.setFooter("Date of mute:")
                    embedLog.setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
                    await (channel as TextChannel).send(embedLog);
                }

                setTimeout(async () => {
                    await reply.delete()
                    return mention.roles.remove(muteRole)
                }, timeParsed)
            }
        } catch (err) {
            Kwako.log.error(err);
        }
    }
}