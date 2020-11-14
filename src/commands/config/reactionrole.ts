import Kwako from '../../Client';
import { Message, MessageEmbed, TextChannel } from 'discord.js';

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    if (args.length === 0) return msg.channel.send({'embed':{
        'title': `\`${guildConf.prefix}reactionrole (embed|role|setup)\``
    }});

    switch (args[0]) {
        // Embeds
        case 'embed':
            switch (args[1]) {
                case 'add':
                    if (args.length < 3) return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole embed add (JSON)\``,
                        'description': "If you don't know what to put in (JSON), use [this link](https://embedbuilder.nadekobot.me)\nBuild your embed, copy the code and paste it there"
                    }});

                    args.shift(); args.shift();
                    let embedString = args.join(' ')
                    let embed = JSON.parse(embedString)

                    if(!embed.embed) {
                        embedString = `{"embed":${embedString}}`
                        embed = JSON.parse(embedString)
                    }

                    let sent = await msg.channel.send(embed)

                    if (msg.deletable) {
                        try {
                            await msg.delete()
                        } catch (ex) {
                            Kwako.log.error(ex)
                        }
                    }

                    await Kwako.db.collection('msg').insertOne({ _id: sent.id, channel: sent.channel.id })

                    Kwako.log.info({msg: 'reactionrole embed add', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
                return;

                case 'edit':
                    if (args.length < 4) return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole embed edit (Message UID) (JSON)\``,
                        'description': "If you don't know what to put in (JSON), use [this link](https://embedbuilder.nadekobot.me)\nBuild your embed, copy the code and paste it there"
                    }});

                    let dbEditEmbed = await Kwako.db.collection('msg').findOne({ _id: args[2] })
                    if (!dbEditEmbed) return msg.reply(":x: > That message doesn't exist!")
                    let editFetchMsg = await msg.channel.messages.fetch(args[2]);

                    args.shift(); args.shift(); args.shift();
                    let editEmbedString = args.join(' ')
                    let editEmbed = JSON.parse(editEmbedString)

                    if(!editEmbed.embed) {
                        embedString = `{"embed":${embedString}}`
                        embed = JSON.parse(embedString)
                    }

                    if (!editFetchMsg.editable) return;
                    await editFetchMsg.edit(embed);

                    if (msg.deletable) {
                        try {
                            await msg.delete()
                        } catch (ex) {
                            Kwako.log.error(ex)
                        }
                    }

                    Kwako.log.info({msg: 'reactionrole embed edit', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
                return;

                case 'remove':
                    if (args.length < 3) return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole embed remove (Message UID)\``,
                        'description': "If you don't know what is the __Message UID__, go in:\n*Discord Settings > Appearance > Developer Mode*\nThen right click/long touch on a RR Embed > Copy ID\nFinally, paste the UID"
                    }});

                    console.log(args)

                    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[2] })
                    if (!dbEmbed) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let channel = msg.guild.channels.resolve(dbEmbed.channel)
                    if(!channel || channel.type !== 'text') return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let fetchMsg = await (channel as TextChannel).messages.fetch(args[2])
                    if(!fetchMsg) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    if (fetchMsg.deletable) {
                        try {
                            await fetchMsg.delete()
                            await msg.react('✅')
                        } catch (ex) {
                            Kwako.log.error(ex)
                            await msg.react('❌')
                        }
                    }

                    await Kwako.db.collection('msg').deleteOne({ _id: args[2] })

                    Kwako.log.info({msg: 'reactionrole embed remove', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
                return;

                default:
                    return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole embed (add|edit|remove)\``
                    }});
            }

        // Roles
        case 'role':
        case 'roles':
            switch (args[1]) {
                case 'add':
                    if (args.length < 5) return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole role add (Message UID) (Emote) (Mention Role)\``,
                        'description': "If you don't know what is the __Message UID__, go in:\n*Discord Settings > Appearance > Developer Mode*\nThen right click/long touch on a RR Embed > Copy ID\nFinally, paste the UID\n\nWorks with custom emotes as well"
                    }});

                    let dbEmbed = await Kwako.db.collection('msg').findOne({ _id: args[2] })
                    if (!dbEmbed) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let channel = msg.guild.channels.resolve(dbEmbed.channel)
                    if(!channel || channel.type !== 'text') return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let embed = await (channel as TextChannel).messages.fetch(args[2])
                    if(!embed) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let emote = args[3]
                    if((emote.startsWith('<:') || emote.startsWith('<a:')) && emote.endsWith('>'))
                        emote = emote.slice(emote.length-19, emote.length-1);

                    let role = args[4];
                    if(role.startsWith('<@&') && role.endsWith('>')) {
                        role = role.slice(3, (role.length-1))
                        let chan = await msg.guild.roles.fetch(role);
                        if(!chan || !chan.editable)
                            return msg.channel.send({'embed':{
                                'title': ":x: This role doesn't exist!"
                            }});
                    } else
                        return msg.channel.send({'embed':{
                            'title': ":x: Please mention a role"
                        }});

                    try {
                        embed.react(emote)
                    } catch (ex) {
                        return msg.channel.send({'embed':{
                            'title': ":x: I can't react to the message!"
                        }});
                    }

                    if (msg.deletable) {
                        try {
                            await msg.react('✅')
                        } catch (ex) {
                            Kwako.log.error(ex)
                            await msg.react('❌')
                        }
                    }

                    await Kwako.db.collection('msg').updateOne({ _id: args[2] }, { $push: { roles: { "id": role, "emote": emote } } })

                    Kwako.log.info({msg: 'addrole', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, role: { id: role, emote: emote }})
                return;

                case 'remove':
                    if (args.length < 4) return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole role remove (Message UID) (Emote)\``,
                        'description': "If you don't know what is the __Message UID__, go in:\n*Discord Settings > Appearance > Developer Mode*\nThen right click/long touch on a RR Embed > Copy ID\nFinally, paste the UID\n\nWorks with custom emotes as well"
                    }});

                    let dbRemoveEmbed = await Kwako.db.collection('msg').findOne({ _id: args[2] })
                    if (!dbRemoveEmbed) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let removeChannel = msg.guild.channels.resolve(dbRemoveEmbed.channel)
                    if(!removeChannel || removeChannel.type !== 'text') return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let fetchMsg = await (removeChannel as TextChannel).messages.fetch(args[2])
                    if(!fetchMsg) return msg.channel.send({'embed':{
                        'title': ":x: This Reaction Roles Embed doesn't exist!"
                    }});

                    let removeEmote = args[3]
                    if((removeEmote.startsWith('<:') || removeEmote.startsWith('<a:')) && removeEmote.endsWith('>'))
                        removeEmote = removeEmote.slice(removeEmote.length-19, removeEmote.length-1);

                    let thing = fetchMsg.reactions.cache.find(val => val.emoji.name === removeEmote);
                    await thing.remove();

                    if (msg.deletable) {
                        try {
                            await msg.react('✅')
                        } catch (ex) {
                            Kwako.log.error(ex)
                            await msg.react('❌')
                        }
                    }

                    await Kwako.db.collection('msg').updateOne({ _id: args[2] }, { $pull: { roles: { "emote": removeEmote } } })

                    Kwako.log.info({msg: 'delrole', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
                return;

                default:
                    return msg.channel.send({'embed':{
                        'title': `\`${guildConf.prefix}reactionrole role (add|remove)\``
                    }});
            }

        case 'setup':
            let rep = await msg.channel.send({'embed':{
                'title': "What's the title of the Reaction Role Message?",
                'footer': {
                    'text': 'Type "cancel" to cancel.'
                }
            }});

            let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
            await rep.delete();
            if(!collected) return msg.channel.send({'embed':{
                'title': "Cancelled..."
            }});

            let title = collected.first().cleanContent;
            if(title.toLowerCase() === "cancel") return msg.channel.send({'embed':{
                'title': "Cancelled..."
            }});

            let stop = false;
            let roles = new Map();
            let roleMsg = await msg.channel.send({'embed':{
                'title': "Current roles binded",
                'description': roles.forEach((val, key) => {
                        return `${key}: <@&${val}>\n`
                    })
            }})

            let repRoles = await msg.channel.send({'embed':{
                'title': "Add a role to the Reaction Role Message",
                'description': "By doing: `emoji @role`",
                'footer': {
                    'text': 'Type "done" when done. | Type "cancel" to cancel.'
                }
            }});
            while (!stop) {
                let collected = await msg.channel.awaitMessages(m => m.author.id === msg.author.id, { max: 1, time: 60000 });
                if(!collected) {
                    stop = true;
                    return msg.channel.send({'embed':{
                        'title': "Cancelled..."
                    }});
                }

                let title = collected.first().cleanContent;
                if(title.toLowerCase() === "cancel") {
                    stop = true;
                    return msg.channel.send({'embed':{
                        'title': "Cancelled..."
                    }});
                }

                if(title.toLowerCase() === "done") {
                    stop = true;
                    return;
                }

                let args = msg.content.trim().split(/ +/g);

                let emote = args[0]
                if((emote.startsWith('<:') || emote.startsWith('<a:')) && emote.endsWith('>'))
                    emote = emote.slice(emote.length-19, emote.length-1);

                let role = args[1];
                if(role.startsWith('<@&') && role.endsWith('>')) {
                    role = role.slice(3, (role.length-1))
                    let chan = await msg.guild.roles.fetch(role);
                    if(!chan || !chan.editable)
                        (await msg.channel.send({'embed':{
                            'title': ":x: This role doesn't exist!"
                        }})).delete({timeout: 6000});
                } else
                    (await msg.channel.send({'embed':{
                        'title': ":x: Please mention a role"
                    }})).delete({timeout: 6000});

                await collected.first().delete().catch(() => {return});

                roles.set(emote, role);

                await roleMsg.edit({'embed':{
                    'title': "Current roles binded",
                    'description': roles.forEach((val, key) => {
                            return `${key}: <@&${val}>\n`
                        })
                }})
            }

            await repRoles.delete();

            let embed = new MessageEmbed();
            embed.setTitle(title);
            roles.forEach((val, key) => {
                embed.addField(key, `<@&${val}>`, true);
            });

            let sent = await msg.channel.send(embed);
            if(sent) {
                roles.forEach((val, key) => {
                    sent.react(key).catch(() => {
                        return msg.channel.send(":x: An unexpected error occurred.");
                    });
                });
            }

            await rep.delete();
            await roleMsg.delete();
            await repRoles.delete();

        return;
    }
};

module.exports.help = {
    name: 'reactionrole',
    aliases: ['rr'],
    usage: "reactionrole",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY']
};