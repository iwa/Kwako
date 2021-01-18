import { Message, MessageEmbed } from "discord.js";
import GuildConfig from "../../interfaces/GuildConfig";

export default async function updateSent(guildConf: GuildConfig, sent: Message) {
    let embed = new MessageEmbed();

    embed.setTitle('What do you want to edit?');

    embed.addField('❕ Prefix', `\`${guildConf.prefix}\``, true);
    embed.addField('<a:ExperienceOrb:735085209573261332> Levels System', `${guildConf.useExpSystem ? '✅' : '❌'} Use it\n${guildConf.showLevelUp ? '✅' : '❌'} Show Level Ups`, true);
    embed.addField('🟣 Booster benefits', guildConf.boosterBenefits ? '✅ Enabled' : '❌ Disabled', true);

    embed.addField('📖 Mod logs channel', guildConf.modLogChannel ? `<#${guildConf.modLogChannel}>` : '❌ Disabled', true);
    embed.addField('💬 Message logs channel', guildConf.msgLogChannel ? `<#${guildConf.msgLogChannel}>` : '❌ Disabled', true);
    embed.addField('⚒ AutoMod', '*See more details...*', true);

    embed.addField('⭐ Starboard channel', `${guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled'}
    Emote: ${guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:'}
    ${guildConf.starReactions || '5'} reactions`, true);
    embed.addField('❓ Suggestions channel', guildConf.suggestionChannel ? `<#${guildConf.suggestionChannel}>` : '❌ Disabled', true);
    embed.addField('⛔ Mute role', guildConf.muteRole ? `<@&${guildConf.muteRole}>` : '❌ Disabled', true);

    let welcome = "none";
    if(guildConf.welcomeMessage !== "")
        welcome = guildConf.welcomeMessage;
    embed.addField('✉️ DM Welcome Message', `\`\`\`${welcome}\n\`\`\``, false);

    embed.setFooter('❌ to cancel');

    let newSent = await sent.edit(embed);

    return newSent;
}