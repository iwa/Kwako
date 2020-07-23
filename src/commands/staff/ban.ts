import { Client, Message, MessageEmbed } from 'discord.js'

module.exports.run = async (bot: Client, msg: Message, args:string[], db:any, commands:any, guildConf:any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD')) && (msg.author.id != process.env.IWA && process.env.SUDO === '0')) return;

    if (args.length >= 2 && msg.channel.type != 'dm') {
        if (msg.mentions.everyone) return;

        let mention = msg.mentions.members.first()

        if (!mention) return;
        if (mention.id === msg.author.id || mention.id === bot.user.id) return;

        try {
            await msg.delete();
        } catch (error) {
            console.error(error);
        }

        args.shift();
        let reason = "no reason provided";
        if(args.length > 1)
            reason = args.join(" ")

        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle(`🚪 **${mention.user.username}** has been kicked by **${msg.author.username}**`)

        try {
            await mention.ban({ days: 7, reason: reason });
            await msg.channel.send(embed);
        } catch (err) {
            await msg.channel.send("I can't ban this person!")
        }
    }
};

module.exports.help = {
    name: 'ban',
    usage: 'ban (mention someone) [reason]',
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY', 'BAN_MEMBERS']
}