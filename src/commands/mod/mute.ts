import { Client, Message } from 'discord.js'
import staff from '../../utils/staff';
import { Db } from 'mongodb';
import { Logger } from 'pino';

module.exports.run = async (bot: Client, msg: Message, args:string[], db: Db, log: Logger, commands:any, guildConf:any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA && process.env.SUDO === '0')) return;

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
            await db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.muteRole']: role.id } });
        })
        await msg.channel.send("🛠 > A 'Muted' role has been generated.");
    }

    let modLogChannel = guildConf.modLogChannel;

    staff.mute(bot, msg, args, log, muteRole, modLogChannel);
};

module.exports.help = {
    name: 'mute',
    usage: 'mute (mention someone) (length)',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};