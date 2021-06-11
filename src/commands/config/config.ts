import Kwako from '../../Client';
import { Message, MessageEmbed } from 'discord.js';
import GuildConfig from '../../interfaces/GuildConfig';
import chooseWhat from '../../utils/config/chooseWhat';
import updateSent from '../../utils/config/updateSent';

let emojis = ['❕', 'a:ExperienceOrb:735085209573261332', '🟣', '📖', '💬', '⭐', '❓', '⛔', '✉️', '❌'];

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return msg.delete();

    if (args[0] === 'edit') {
        let embed = new MessageEmbed();

        embed.setTitle('Loading...');

        let sent = await msg.channel.send(embed);

        for (const emote of emojis)
            await sent.react(emote)

        if (sent)
            updateSent(guildConf, sent);

        await chooseWhat(msg, args, guildConf, sent);

    } else {
        let embed = new MessageEmbed();

        embed.setAuthor(msg.guild.name, msg.guild.iconURL({ dynamic: true }));
        embed.setTitle('Server Configuration');
        embed.setDescription(`Do \`${guildConf.prefix}config edit\` to edit the configuration.`);

        embed.addField('❕ Prefix', `\`${guildConf.prefix}\``, true);
        embed.addField('<a:ExperienceOrb:735085209573261332> Levels System', `${guildConf.useExpSystem ? '✅' : '❌'} Use it\n${guildConf.showLevelUp ? '✅' : '❌'} Show Level Ups`, true);
        embed.addField('🟣 Booster benefits', guildConf.boosterBenefits ? '✅ Enabled' : '❌ Disabled', true);

        embed.addField('📖 Mod logs channel', guildConf.modLogChannel ? `<#${guildConf.modLogChannel}>` : '❌ Disabled', true);
        embed.addField('💬 Message logs channel', guildConf.msgLogChannel ? `<#${guildConf.msgLogChannel}>` : '❌ Disabled', true);
        embed.addField('⚒ AutoMod', '*Coming later...*', true);

        embed.addField('⭐ Starboard channel', `${guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled'}
        Emote: ${guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:'}
        ${guildConf.starReactions || '5'} reactions`, true);
        embed.addField('❓ Suggestions channel', guildConf.suggestionChannel ? `<#${guildConf.suggestionChannel}>` : '❌ Disabled', true);
        embed.addField('⛔ Mute role', guildConf.muteRole ? `<@&${guildConf.muteRole}>` : '❌ Disabled', true);

        let welcome = "none";
        if (guildConf.welcomeMessage !== "")
            welcome = guildConf.welcomeMessage;
        embed.addField('✉️ DM Welcome Message', `\`\`\`${welcome}\n\`\`\``, false);

        await msg.channel.send(embed);
    }


    Kwako.log.info({ msg: 'config', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } })
};

module.exports.help = {
    name: 'config',
    usage: "config",
    desc: "Set a custom configuration for this Guild",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};