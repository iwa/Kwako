/**
 * Class regrouping staff commands
 * @packageDocumentation
 * @module Staff
 * @category Utils
 */
import { Client, Message, MessageEmbed, TextChannel } from 'discord.js'
import { Logger } from 'pino';
const timespan = require("timespan-parser")("min");

export default class staff {

    /**
     * Involves Discord integrated bulk delete
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async bulk(msg: Message, args: string[], log: Logger) {
        if (args.length !== 0) {
            let channel: any = msg.channel
            if (msg.channel.type !== "dm") {
                msg.delete().catch(console.error);
                let nb = parseInt(args[0])
                msg.channel.bulkDelete(nb)
                    .then(() => {
                        log.info({msg: 'bulk', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id, bulk: { channel: channel.id, name: channel.name, x: nb }});
                    })
                    .catch(log.error);
            }
        }
        else
            return msg.channel.send({ "embed": { "title": ":x: > **Incomplete command.**", "color": 13632027 } });

    }

    /**
     * Mutes a member of the server
     * @param bot - Discord Client object
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async mute(bot: Client, msg: Message, args: string[], log: Logger, muteRole: string, modLogChannel: string): Promise<void> {
        if (args.length >= 2 && msg.channel.type != 'dm') {
            if (msg.mentions.everyone) return;

            let mention = msg.mentions.members.first()

            if (!mention) return;
            if (mention.id == msg.author.id || mention.id == bot.user.id) return;

            if (msg.author.id != process.env.IWA && mention.hasPermission('MANAGE_GUILD')) return;

            try {
                msg.delete();
            } catch (error) {
                log.error(error);
            }

            args.shift();
            let time = args.join(" ")
            let timeParsed = await timespan.parse(time, "msec");
            let timeParsedString = await timespan.getString(timeParsed, "msec");

            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle(`:octagonal_sign: **${mention.user.username}**, you've been muted for \`${timeParsedString}\` by **${msg.author.username}**`)

            try {
                await mention.roles.add(muteRole)
                let reply = await msg.channel.send(embed)

                log.info({msg: 'mute', author: { id: msg.author.id, name: msg.author.tag }, guild: msg.guild.id})

                if(modLogChannel) {
                    let channel = await bot.channels.fetch(modLogChannel);
                    let embedLog = new MessageEmbed();
                    embedLog.setTitle("Member muted");
                    embedLog.setDescription(`Who: ${mention.user.tag} (<@${mention.id}>)\nBy: <@${msg.author.id}>\nFor: \`${timeParsedString}\``);
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
            } catch (err) {
                log.error(err);
            }
        }
    }

    /**
     * Enables / Disables maintenance mode
     * (only usable by iwa)
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async sleep(bot: Client, msg: Message): Promise<"1" | "0"> {
        if (msg.author.id != process.env.IWA) return;
        if (process.env.SLEEP == '0') {
            await bot.user.setPresence({ activity: { name: "being updated...", type: 0 }, status: 'dnd' })
                .then(() => {
                    msg.react("✅");
                    console.log("info: sleeping enabled")
                })
                .catch(console.error);
            msg.channel.send("Sleeping Mode On!")
            return process.env.SLEEP = '1';
        } else {
            await bot.user.setPresence({ activity: { name: `with ${bot.guilds.cache.size} guilds`, type: 0 }, status: 'online' })
                .then(() => {
                    msg.react("✅");
                    console.log("info: sleeping disabled")
                })
                .catch(console.error);
            msg.channel.send("Sleeping Mode Off!")
            return process.env.SLEEP = '0';
        }
    }
}