import Kwako from '../../Client';
import { Message, MessageEmbed } from 'discord.js';

let emojis = ['❕', 'a:ExperienceOrb:735085209573261332', '🟣', '📖', '❓', '⛔', '⭐', '✉️', '❌'];

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return msg.delete();


    if(args[0] === 'edit') {
        let embed = new MessageEmbed();

        embed.setTitle('What do you want to edit?');

        embed.addField('❕ Prefix', `\`${guildConf.prefix}\``, true);
        embed.addField('<a:ExperienceOrb:735085209573261332> Levels System', `${guildConf.useExpSystem ? '✅' : '❌'} Use it\n${guildConf.showLevelUp ? '✅' : '❌'} Show Level Ups`, true);
        embed.addField('🟣 Booster benefits', guildConf.boosterBenefits ? '✅ Enabled' : '❌ Disabled', true);

        embed.addField('📖 Mod logs channel', guildConf.modLogChannel ? `<#${guildConf.modLogChannel}>` : '❌ Disabled', true);
        embed.addField('❓ Suggestions channel', guildConf.suggestionChannel ? `<#${guildConf.suggestionChannel}>` : '❌ Disabled', true);
        embed.addField('⛔ Mute role', guildConf.muteRole ? `<@&${guildConf.muteRole}>` : '❌ Disabled', true);

        embed.addField('⭐ Starboard channel', `${guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled'}
        Emote: ${guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:'}
        ${guildConf.starReactions || '5'} reactions`, true);

        let welcome = "none";
        if(guildConf.welcomeMessage !== "")
            welcome = guildConf.welcomeMessage;
        embed.addField('✉️ DM Welcome Message', `\`\`\`${welcome}\n\`\`\``, false);

        embed.setFooter('❌ to cancel');

        let sent = await msg.channel.send(embed);

        for(const emote of emojis)
            await sent.react(emote)

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
        embed.addField('❓ Suggestions channel', guildConf.suggestionChannel ? `<#${guildConf.suggestionChannel}>` : '❌ Disabled', true);
        embed.addField('⛔ Mute role', guildConf.muteRole ? `<@&${guildConf.muteRole}>` : '❌ Disabled', true);

        embed.addField('⭐ Starboard channel', `${guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled'}
        Emote: ${guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:'}
        ${guildConf.starReactions || '5'} reactions`, true);

        let welcome = "none";
        if(guildConf.welcomeMessage !== "")
            welcome = guildConf.welcomeMessage;
        embed.addField('✉️ DM Welcome Message', `\`\`\`${welcome}\n\`\`\``, false);

        await msg.channel.send(embed);
    }


    Kwako.log.info({msg: 'config', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'config',
    usage: "config",
    desc: "Set a custom configuration for this Guild",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};

async function chooseWhat(msg: Message, args: string[], guildConf: any, sent: Message): Promise<any> {
    let collected = await sent.awaitReactions((_reaction, user) => (emojis.includes(_reaction.emoji.name) || emojis.includes(_reaction.emoji.identifier)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return;

    let emote = collected.first().emoji.name;

    if(emote === '❕')
        return editPrefix(msg, args, guildConf, sent);
    if(emote === 'ExperienceOrb')
        return editExpSystem(msg, args, guildConf, sent, null);
    if(emote === '🟣')
        return editBoosterBenefit(msg, args, guildConf, sent);
    if(emote === '📖')
        return editModLogs(msg, args, guildConf, sent);
    if(emote === '❓')
        return editSuggestions(msg, args, guildConf, sent);
    if(emote === '⛔')
        return editMuteRole();
    if(emote === '⭐')
        return editStarboard();
    if(emote === '✉️')
        return editWelcomeMessage();

    if(emote === '❌') {
        await msg.delete().catch(() => {return});
        return sent.delete();
    }
}

async function updateSent(guildConf: any, sent: Message) {
    let embed = new MessageEmbed();

    embed.setTitle('What do you want to edit?');

    embed.addField('❕ Prefix', `\`${guildConf.prefix}\``, true);
    embed.addField('<a:ExperienceOrb:735085209573261332> Levels System', `${guildConf.useExpSystem ? '✅' : '❌'} Use it\n${guildConf.showLevelUp ? '✅' : '❌'} Show Level Ups`, true);
    embed.addField('🟣 Booster benefits', guildConf.boosterBenefits ? '✅ Enabled' : '❌ Disabled', true);

    embed.addField('📖 Mod logs channel', guildConf.modLogChannel ? `<#${guildConf.modLogChannel}>` : '❌ Disabled', true);
    embed.addField('❓ Suggestions channel', guildConf.suggestionChannel ? `<#${guildConf.suggestionChannel}>` : '❌ Disabled', true);
    embed.addField('⛔ Mute role', guildConf.muteRole ? `<@&${guildConf.muteRole}>` : '❌ Disabled', true);

    embed.addField('⭐ Starboard channel', `${guildConf.starboardChannel ? `<#${guildConf.starboardChannel}>` : '❌ Disabled'}
    Emote: ${guildConf.customEmote ? `<#${guildConf.customEmote}>` : ':star:'}
    ${guildConf.starReactions || '5'} reactions`, true);

    let welcome = "none";
    if(guildConf.welcomeMessage !== "")
        welcome = guildConf.welcomeMessage;
    embed.addField('✉️ DM Welcome Message', `\`\`\`${welcome}\n\`\`\``, false);

    embed.setFooter('❌ to cancel');

    let newSent = await sent.edit(embed);

    return newSent;
}

async function editPrefix(msg: Message, args: string[], guildConf: any, sent: Message): Promise<any> {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '❕ Change the prefix',
        'description': 'Send in the channel the new prefix.\n3 characters max.',
        'footer': {
            'text': 'Type "cancel" to cancel the edit.'
        }
    }});

    let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
    if(!collected) return;

    let prefix = collected.first().cleanContent.toLowerCase();

    sentEdit.delete();
    collected.first().delete();

    if(prefix.includes('cancel')) {
        await sent.reactions.resolve('❕').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(prefix.length > 3) {
        await (await msg.channel.send('superior of 3 characters!!!')).delete({ timeout: 6000 });
        return editPrefix(msg, args, guildConf, sent);
    }

    Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.prefix']: prefix } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('❕').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}

async function editExpSystem(msg: Message, args: string[], guildConf: any, sent: Message, sentEdit: Message | null): Promise<any> {
    if(!sentEdit) {
        sentEdit = await msg.channel.send({'embed':{
            'title': '<a:ExperienceOrb:735085209573261332> Edit the Levels System',
            'fields': [
                {
                    "name": ":one: Enable Levels System",
                    "value": guildConf.useExpSystem ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":two: Show Level Ups",
                    "value": guildConf.showLevelUp ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":door: Return",
                    "value": "Return to main edit screen",
                    "inline": true
                }
            ]
        }});
        sentEdit.react('1️⃣'); sentEdit.react('2️⃣'); sentEdit.react('🚪');
    } else
        await sentEdit.edit({'embed':{
            'title': '<a:ExperienceOrb:735085209573261332> Edit the Levels System',
            'fields': [
                {
                    "name": ":one: Enable Levels System",
                    "value": guildConf.useExpSystem ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":two: Show Level Ups",
                    "value": guildConf.showLevelUp ? '✅' : '❌',
                    "inline": true
                },
                {
                    "name": ":door: Return",
                    "value": "Return to main edit screen",
                    "inline": true
                }
            ]
        }});

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['1️⃣', '2️⃣', '🚪'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return;

    let emote = collected.first();

    if(emote.emoji.name === '🚪') {
        sentEdit.delete();
        sent = await updateSent(guildConf, sent);
        await sent.reactions.resolve('735085209573261332').users.remove(msg.author.id);
        return chooseWhat(msg, args, guildConf, sent);
    }

    if(emote.emoji.name === '1️⃣') {
        await sentEdit.reactions.resolve('1️⃣').users.remove(msg.author.id);

        if(guildConf.useExpSystem === true)
            guildConf.useExpSystem = false;
        else
            guildConf.useExpSystem = true;

        Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.useExpSystem']: guildConf.useExpSystem } });
    }

    if(emote.emoji.name === '2️⃣') {
        await sentEdit.reactions.resolve('2️⃣').users.remove(msg.author.id);

        if(guildConf.useExpSystem === false)
            await (await msg.channel.send({'embed':{
                'title': ':x: Impossible, you need to have the Levels System enabled to edit this parameter'
            }})).delete({ timeout: 6000 });
        else {
            if(guildConf.showLevelUp === true)
                guildConf.showLevelUp = false;
            else
                guildConf.showLevelUp = true;

            console.log(guildConf.showLevelUp)

            Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.showLevelUp']: guildConf.showLevelUp } });
        }
    }

    return editExpSystem(msg, args, guildConf, sent, sentEdit);
}

async function editBoosterBenefit(msg: Message, args: string[], guildConf: any, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '🟣 Set Booster benefits',
        'description': 'Do you want to offer to your Nitro Boosters a 1.25x experience points multiplier perk, as a thanks for their support?\n\n*Note: also applies to the server staff, as a thanks for their work.*',
        'fields': [
            {
                "name": "✅",
                "value": "**Enable**",
                "inline": true
            },
            {
                "name": "❌",
                "value": "**Disable**",
                "inline": true
            }
        ]
    }});

    sentEdit.react('✅'); sentEdit.react('❌');

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return sentEdit.delete();

    let emote = collected.first();

    sentEdit.delete();

    let value = false;
    if(emote.emoji.name === '✅') value = true;
    else if (emote.emoji.name === '❌') value = false;

    guildConf.boosterBenefits = value;

    Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.boosterBenefits']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('🟣').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}

async function editModLogs(msg: Message, args: string[], guildConf: any, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '📖 Set Mod Logs channel',
        'fields': [
            {
                "name": "✅",
                "value": "**Enable**",
                "inline": true
            },
            {
                "name": "❌",
                "value": "**Disable**",
                "inline": true
            }
        ]
    }});

    sentEdit.react('✅'); sentEdit.react('❌');

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return sentEdit.delete();

    let emote = collected.first();

    sentEdit.delete();

    let value = '';
    if(emote.emoji.name === '✅') {
        let sentEdit = await msg.channel.send({'embed':{
            'title': '📖 Set Mod Logs channel',
            'description': 'Tag the channel you want the Mod Logs to be sent in.'
        }});

        let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
        await sentEdit.delete();

        if(!collected) return;
        await collected.first().delete().catch(() => {return})

        let channel = collected.first().mentions.channels.first();
        if(!channel) return;

        if(!channel.viewable) return (await msg.channel.send({'embed':{
            'title': ":x: I can't access to the channel! Make sure I can read and send message in this channel."
        }})).delete({ timeout: 10000 });

        value = channel.id;
    }
    else if (emote.emoji.name === '❌') value = '';

    guildConf.modLogChannel = value;

    Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.modLogChannel']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('📖').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}

async function editSuggestions(msg: Message, args: string[], guildConf: any, sent: Message) {
    let sentEdit = await msg.channel.send({'embed':{
        'title': '❓ Set a Suggestions channel',
        'fields': [
            {
                "name": "✅",
                "value": "**Enable**",
                "inline": true
            },
            {
                "name": "❌",
                "value": "**Disable**",
                "inline": true
            }
        ]
    }});

    sentEdit.react('✅'); sentEdit.react('❌');

    let collected = await sentEdit.awaitReactions((_reaction, user) => (['✅', '❌'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return sentEdit.delete();

    let emote = collected.first();

    sentEdit.delete();

    let value = '';
    if(emote.emoji.name === '✅') {
        let sentEdit = await msg.channel.send({'embed':{
            'title': '❓ Set a Suggestions channel',
            'description': 'Tag the channel you want to be the suggestions channel.'
        }});

        let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
        await sentEdit.delete();

        if(!collected) return;
        await collected.first().delete().catch(() => {return})

        let channel = collected.first().mentions.channels.first();
        if(!channel) return;

        if(!channel.viewable) return (await msg.channel.send({'embed':{
            'title': ":x: I can't access to the channel! Make sure I can read and send message in this channel."
        }})).delete({ timeout: 10000 });

        value = channel.id;
    }
    else if (emote.emoji.name === '❌') value = '';

    guildConf.suggestionChannel = value;

    Kwako.db.collection('settings').updateOne({ _id: msg.guild.id }, { $set: { ['config.suggestionChannel']: value } });

    sent = await updateSent(guildConf, sent);
    await sent.reactions.resolve('❓').users.remove(msg.author.id);
    return chooseWhat(msg, args, guildConf, sent);
}

async function editMuteRole() {
    return;
}

async function editStarboard() {
    return;
}

async function editWelcomeMessage() {
    return;
}