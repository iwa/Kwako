import Kwako from '../../Client'
import { Message, MessageEmbed, TextChannel } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if (!msg.member.hasPermission('MANAGE_MESSAGES')) return;

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
            await Kwako.db.collection('guilds').updateOne({ _id: msg.guild.id }, { $set: { ['config.muteRole']: role.id } });
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
    usage: 'mute (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};

async function mute(msg: Message, args: string[], muteRole: string, modLogChannel: string): Promise<void> {
    if (args.length >= 1 && msg.channel.type != 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === msg.author.id || mention.id === Kwako.user.id) return;

        if (msg.author.id !== msg.guild.ownerID && mention.hasPermission('MANAGE_MESSAGES')) return;

        try {
            msg.delete();
        } catch (error) {
            Kwako.log.error(error);
        }

        args.shift();
        let reason = "no reason provided";
        if(args.length >= 1)
            reason = args.join(" ")

        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`:octagonal_sign: **${mention.user.username}**, you've been muted`)
            .setDescription(`**Reason:** ${reason}`);

        try {
            let res = await mention.roles.add(muteRole).catch(async () => {
                    await msg.channel.send({'embed':{
                        'title': ":x: I can't mute people!",
                        'description': "Please make sure the 'Muted' role is below my highest role."
                    }});
                });

            if(res) {
                await msg.channel.send(embed);

                await Kwako.db.collection('infractions').insertOne({ target: mention.id, author: msg.author.id, guild: msg.guild.id, type: 'mute', reason: reason, date: msg.createdTimestamp });

                Kwako.log.info({msg: 'mute', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})

                if(modLogChannel) {
                    let channel = await Kwako.channels.fetch(modLogChannel);
                    const embedLog = new MessageEmbed()
                        .setTitle("🤐 Member muted")
                        .setDescription(`**Who:** ${mention.user.tag} (<@${mention.id}>)\n**By:** <@${msg.author.id}>\n**Reason:** \`${reason}\``)
                        .setColor(9392322)
                        .setTimestamp(msg.createdTimestamp)
                        .setFooter("Date of mute:")
                        .setAuthor(msg.author.username, msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
                    await (channel as TextChannel).send(embedLog);
                }
            }
        } catch (err) {
            Kwako.log.error(err);
        }
    }
}