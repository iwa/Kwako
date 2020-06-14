/**
 * Youtube Music Module
 * @packageDocumentation
 * @module Music
 * @category Utils
 */
import { Client, Message, MessageEmbed, Util, VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';
import * as YoutubeStream from 'ytdl-core';
import { YouTube, Video } from 'popyt';
const yt = new YouTube(process.env.YT_TOKEN)
import utilities from './utilities'

/** @desc Voice Channel where the bot connects and plays music */
let VC = process.env.MUSICVC;

let queue: { url: string, title: string, length: string }[] = []
let skippers: string[] = []
let skipReq = 0
let loop = 0

module.exports = class music {

    /**
     * Parses the request (keywords or link)
     * and try to play the video
     * @param bot - Discord Client object
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async play(bot: Client, msg: Message, args: string[]) {
        if (!args[0]) return;

        let voiceChannel: any = msg.guild.channels.cache.find(val => val.id == VC)
        if (voiceChannel == null) return;
        if (!voiceChannel.members.find((val: any) => val.id == msg.author.id)) return msg.channel.send(":x: > **You need to be connected in the voice channel before I join it !**")

        let video_url = args[0].split('&')

        let error, data;

        if (video_url[0].match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

            const playlist = await yt.getPlaylist(video_url[0]).catch(console.error)
            if (!playlist) return;

            let reply = await msg.channel.send(":warning: Are you sure you want to add all the videos of __" + playlist.title + "__ to the queue ? *(**" + playlist.data.contentDetails.itemCount + "** videos)*")
            await reply.react('✅');
            await reply.react('❌');

            let collected = await reply.awaitReactions((_reaction, user) => user.id == msg.author.id, { time: 10000 })

            if (collected.first() == undefined) {
                reply.delete()
                return msg.channel.send(":x: > **You didn't choose anything, request cancelled...**")
            }
            if (collected.find(val => val.emoji.name == '✅') && collected.find(val => val.emoji.name == '❌')) {
                reply.delete()
                return msg.channel.send(":x: > **You must choose only one of both reactions!**")
            }

            let emote = collected.first().emoji.name

            if (emote == '❌') return;
            if (emote != '✅') return;

            reply.delete()
            const embed = new MessageEmbed();
            embed.setTitle("Adding all the playlist's videos to the queue...")
            embed.setFooter(`Added by ${msg.author.username}`)
            embed.setColor('LUMINOUS_VIVID_PINK')
            msg.channel.send(embed)

            const videos = await playlist.fetchVideos();
            let errors = 0;

            let bar = new Promise((resolve, reject) => {
                videos.forEach(async (video: Video, index: number, array: Video[]) => {
                    const url: string = video.url
                    error = false;
                    if (!queue.find(song => song.url === url)) {
                        data = await YoutubeStream.getInfo(url).catch(() => { error = true; errors++; })
                        if (!error && data) {
                            queue.push({ url, title: Util.escapeMarkdown(data.title), length: data.length_seconds })
                        }
                    }
                    if (index === array.length - 1) resolve();
                });
            });

            bar.then(async () => {
                const embedDone = new MessageEmbed();
                embedDone.setTitle("**Done!**")
                embedDone.setColor('LUMINOUS_VIVID_PINK')

                if (errors > 0) embedDone.setDescription("Some videos are unavailable :(");

                msg.channel.send(embedDone)

                let connection: null | VoiceConnection = bot.voice.connections.find(val => val.channel.id == voiceChannel.id);

                if (!connection) {
                    try {
                        const voiceConnection = await voiceChannel.join();
                        playSong(msg, voiceConnection, voiceChannel);
                    }
                    catch (ex) {
                        console.error(ex)
                    }
                }
            });
            return;
        }

        if (YoutubeStream.validateURL(video_url[0])) {
            launchPlay(msg, voiceChannel, video_url[0], data)
        } else {
            let keywords = args.join(' ')

            let video = await yt.searchVideos(keywords, 1).then((data: any) => {
                return data.results[0].url
            })

            if (!YoutubeStream.validateURL(video)) return;

            launchPlay(msg, voiceChannel, video, data)
        }
    }

    /**
     * Removes a song from the queue
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static remove(msg: Message, args: string[]) {
        let queueID: number = parseInt(args[0]);

        if (isNaN(queueID)) return;

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setAuthor('Removed from the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        embed.setDescription(`**${queue[queueID].title}**`)
        embed.setFooter(`Removed by ${msg.author.username}`)

        msg.channel.send(embed)

        console.log(`musc: remove from queue: ${msg.author.tag} removed ${queue[queueID].title}`)
        queue.splice(queueID, 1)
    }

    /**
     * Sends the queue
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static list(msg: Message, args: string[]) {
        if (args.length > 0) return;
        if (queue.length < 0) return;

        msg.channel.startTyping();

        const embed = new MessageEmbed();
        embed.setColor('GREEN')

        if (queue.length <= 1)
            embed.setTitle("**:cd: The queue is empty.**")
        else {
            embed.setTitle("**:cd: Here's the queue:**")

            queue.forEach(async (song, index) => {
                if (index == 0 || index > 10) return;

                let date = new Date(null)
                date.setSeconds(parseInt(song.length, 10))
                let timeString = date.toISOString().substr(11, 8)

                embed.addField(`${index} : **${song.title}**, *${timeString}*`, song.url)
            })
        }

        if (queue.length > 10) embed.setFooter(`and ${(queue.length - 10)} more...`)
        msg.channel.stopTyping(true);
        msg.channel.send(embed);

        console.log(`musc: show queue by ${msg.author.tag}`)
    }

    /**
     * Adds a voteskip
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async skip(bot: Client, msg: Message) {
        let voiceChannel = msg.guild.channels.cache.find(val => val.id == VC)

        let voiceConnection = bot.voice.connections.find(val => val.channel.id == VC);
        if (!voiceConnection) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        if (skippers.indexOf(msg.author.id) == -1) {
            skippers.push(msg.author.id);
            skipReq++;

            const embed = new MessageEmbed();
            embed.setColor('GREEN')
            embed.setAuthor("Your voteskip has been registered!", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            msg.channel.send(embed)

            console.log(`info: voteskip by ${msg.author.tag}`)

            if (skipReq >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
                let dispatcher = voiceConnection.dispatcher
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("Half of the people have voted, skipping...")
                msg.channel.send(embed)
                loop = 0;
                dispatcher.end()
                console.log(`musc: skipping song`)
            } else {
                const embed = new MessageEmbed();
                embed.setColor('BRIGHT_RED')
                embed.setTitle("You need **" + (Math.ceil((voiceChannel.members.size - 1) / 2) - skipReq) + "** more skip vote to skip!")
                msg.channel.send(embed)
            }
        } else {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("You already voted for skipping!")
            msg.channel.send(embed)
        }
    }

    /**
     * Clears the queue
     * @param msg - Message object
     */
    static async clear(msg: Message) {
        queue = [];

        await msg.react('✅');

        console.log(`musc: clear queue by ${msg.author.tag}`)
    }

    /**
     * Stops the music
     * @param msg - Message object
     */
    static async stop(msg: Message) {
        let voiceChannel: any = msg.guild.channels.cache.find(val => val.id == VC)

        queue = [];

        await msg.react('✅');
        await voiceChannel.leave()
        console.log(`musc: stop by ${msg.author.tag}`)
    }

    /**
     * Forceskips the music
     * (only usable by the staff)
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async forceskip(bot: Client, msg: Message) {
        if (!msg.member.hasPermission('MANAGE_GUILD')) return;

        let voiceConnection = bot.voice.connections.find(val => val.channel.id == VC);
        if (!voiceConnection) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        let dispatcher = voiceConnection.dispatcher

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setAuthor("Forced skip...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        msg.channel.send(embed)
        loop = 0;

        dispatcher.end()

        return console.log(`musc: forceskip by ${msg.author.tag}`)
    }

    /**
     * Enables / Disables looping the current song
     * @param msg - Message object
     */
    static loop(msg: Message) {
        if (loop == 0) {
            loop = 1
            console.log(`info: loop enabled by ${msg.author.tag}`)
            const embed = new MessageEmbed();
            embed.setAuthor("🔂 Looping the current song...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        }
        else if (loop == 1) {
            loop = 0
            console.log(`info: loop disabled by ${msg.author.tag}`)
            const embed = new MessageEmbed();
            embed.setAuthor("This song will no longer be looped...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        }
    }

    /**
     * Shows the current played song
     * @param msg - Message object
     * @param bot - Discord Client object
     */
    static async np(msg: Message, bot: Client) {
        let voiceConnection = bot.voice.connections.find(val => val.channel.id == VC);
        if (!voiceConnection) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        let date = new Date(null)
        date.setSeconds(parseInt(queue[0].length, 10))
        let timeString = date.toISOString().substr(11, 8)
        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setTitle("**:cd: Now Playing:**")

        let desc = `[${queue[0].title}](${queue[0].url})`;
        if (loop == 1) desc += "\n🔂 Currently looping this song - type `?loop` to disable";
        embed.setDescription(desc)

        let time = new Date(voiceConnection.dispatcher.streamTime).toISOString().slice(11, 19)
        embed.setFooter(`${time} / ${timeString}`)

        let infos = await yt.getVideo(queue[0].url);
        let thumbnail = infos.thumbnails
        embed.setThumbnail(thumbnail.high.url)

        msg.channel.send(embed)

        console.log(`info: nowplaying by ${msg.author.tag}`)
    }

    /**
     * Pauses the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async pause(bot: Client, msg: Message) {
        let dispatcher = await fetchDispatcher(bot, msg);
        dispatcher.pause(false);

        await msg.react('✅');
    }

    /**
     * Resumes the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async resume(bot: Client, msg: Message) {
        let dispatcher = await fetchDispatcher(bot, msg);
        dispatcher.resume();

        await msg.react('✅');
    }
}

/**
 * Plays the song in the top of the queue
 * @param msg - Message object
 * @param voiceConnection - Voice connection of the bot
 * @param voiceChannel - The voice channel where the bot should be connected in
 */
async function playSong(msg: Message, voiceConnection: VoiceConnection, voiceChannel: VoiceChannel) {
    const video = YoutubeStream(queue[0].url, { filter: "audioonly", quality: "highestaudio", highWaterMark: 1024 });

    video.on('error', () => {
        return msg.channel.send(":x: > **There was an unexpected error with playing the video, please retry later**")
    })

    voiceConnection.play(video, { volume: 0.8, bitrate: 64000, highWaterMark: 48, fec: true, plp: 0 })
        .on('start', async () => {
            if (loop == 0) {
                let date = new Date(null)
                date.setSeconds(parseInt(queue[0].length, 10))
                let timeString = date.toISOString().substr(11, 8)
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("**:cd: Now Playing:**")
                embed.setDescription(`[${queue[0].title}](${queue[0].url})`)
                embed.setFooter(`Length : ${timeString}`)
                let infos = await yt.getVideo(queue[0].url);
                let thumbnail = infos.thumbnails
                embed.setThumbnail(thumbnail.high.url)
                msg.channel.send(embed)
                console.log(`musc: playing: ${queue[0].title}`)
            }
        }).on('finish', () => {
            if (loop == 0)
                queue.shift()

            if (queue.length == 0) {
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("🚪 Queue finished. Disconnecting...")
                skipReq = 0;
                skippers = [];
                loop = 0;
                msg.channel.send(embed)
                voiceChannel.leave();
            } else {
                skipReq = 0;
                skippers = [];
                playSong(msg, voiceConnection, voiceChannel)
            }
        }).on('error', console.error);
}

/**
 * Parses the top video in the queue
 * and check if the video is playable
 * @param msg - Message object
 * @param voiceChannel - The voice channel where the bot should be connected in
 * @param video_url - The video url to check and play
 * @param data - Youtube Stream data infos
 */
async function launchPlay(msg: Message, voiceChannel: VoiceChannel, video_url: string, data: void | YoutubeStream.videoInfo) {
    msg.channel.startTyping();
    let error = false;
    if (!queue.find(song => song.url === video_url)) {
        data = await YoutubeStream.getInfo(video_url).catch(() => { error = true; })
        if (!error && data) {
            queue.push({ url: video_url, title: Util.escapeMarkdown(data.title), length: data.length_seconds })
        }
    } else {
        msg.channel.stopTyping()
        return msg.channel.send({ "embed": { "title": `:x: > **This video is already in the queue!**`, "color": 13632027 } })
    }

    if (error) {
        msg.channel.stopTyping()
        return msg.channel.send({ "embed": { "title": `:x: > **This video is unavailable :(**`, "color": 13632027 } })
    }

    msg.delete();

    if (queue[0].url != video_url && data) {
        const embed = new MessageEmbed();
        embed.setAuthor('Successfully added to the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        embed.setDescription(`**${data.title}**`)
        embed.setFooter(`Added by ${msg.author.username}`)
        embed.setColor('LUMINOUS_VIVID_PINK')
        msg.channel.stopTyping()
        await msg.channel.send(embed)
        console.log(`musc: add to queue: ${msg.author.tag} added ${data.title}`)
    }
    else {
        msg.channel.stopTyping()
        try {
            const voiceConnection = await voiceChannel.join();
            playSong(msg, voiceConnection, voiceChannel);
        }
        catch (ex) {
            console.error(ex)
        }
    }
}

/**
 * Try to fetch an existing dispatcher if the bot is already
 * connected to the voice channel
 * @param bot - Discord Client object
 * @param msg - Message object
 * @returns The existing StreamDispatcher (if exists)
 */
async function fetchDispatcher(bot: Client, msg: Message): Promise<StreamDispatcher> {
    let voiceConnection = bot.voice.connections.find(val => val.channel.id == VC);
    if (!voiceConnection) {
        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle("I'm not playing anything right now!")
        await msg.channel.send(embed);
    } else {
        let dispatcher = voiceConnection.dispatcher;
        return dispatcher;
    }
}