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

let queue:Map<string, string[]> = new Map();
let skippers:Map<string, string[]> = new Map();
let skipReq:Map<string, number> = new Map();
let loop:Map<string, boolean> = new Map();

export default class music {

    /**
     * Parses the request (keywords or link)
     * and try to play the video
     * @param bot - Discord Client object
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async play(bot: Client, msg: Message, args: string[]) {
        if (!args[0]) return;

        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        if (voiceChannel == null) return;
        if (!voiceChannel.members.find((val: any) => val.id == msg.author.id)) return msg.channel.send(":x: > **You need to be connected in a voice channel before I join it !**")

        let video_url = args[0].split('&')

        if (video_url[0].match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {

            const playlist = await yt.getPlaylist(video_url[0]).catch(console.error)
            if (!playlist) return;

            let reply = await msg.channel.send(`:warning: Are you sure you want to add all the videos of __${playlist.title}__ to the queue ? *(**${playlist.data.contentDetails.itemCount}** videos)*`)
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

            if (emote != '✅') return;

            reply.delete()
            const embed = new MessageEmbed();
            embed.setTitle("Adding all the playlist's videos to the queue...")
            embed.setFooter(`Added by ${msg.author.username}`)
            embed.setColor('LUMINOUS_VIVID_PINK')
            msg.channel.send(embed)

            let videos = await playlist.fetchVideos();
            let errors = 0;

            let bar = new Promise((resolve, reject) => {
                let queu = queue.get(msg.guild.id) ? queue.get(msg.guild.id) : [];
                videos.forEach(async (video: Video, index: number, array: Video[]) => {
                    let url = video.url
                    if (queu && !queu.find(song => song === url)) {
                        queu.push(url)
                    }
                    if (index === array.length - 1){
                        queue.set(msg.guild.id, queu)
                        resolve();
                    }
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
        } else {
            if (YoutubeStream.validateURL(video_url[0])) {
                launchPlay(msg, voiceChannel, video_url[0])
            } else {
                let keywords = args.join(' ')

                let video = await yt.searchVideos(keywords, 1).then((data: any) => {
                    return data.results[0].url
                })

                if (!YoutubeStream.validateURL(video)) return;

                launchPlay(msg, voiceChannel, video)
            }
        }
    }

    /**
     * Removes a song from the queue
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async remove(msg: Message, args: string[]) {
        let queueID: number = parseInt(args[0]);

        if (isNaN(queueID)) return;
        let queu = queue.get(msg.guild.id);

        let data = await YoutubeStream.getInfo(queu[queueID])

        if (!data) return;

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setAuthor('Removed from the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        embed.setDescription(`**${data.videoDetails.title}**`)
        embed.setFooter(`Removed by ${msg.author.username}`)

        msg.channel.send(embed)

        console.log(`musc: remove from queue: ${msg.author.tag} removed ${data.videoDetails.title}`)
        queu.splice(queueID, 1);
        queue.set(msg.guild.id, queu);
    }

    /**
     * Sends the queue
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async list(msg: Message, args: string[]) {
        if (args.length > 0) return;
        let queu = queue.get(msg.guild.id) ? queue.get(msg.guild.id) : [];
        if (queu.length < 0) return;

        const embed = new MessageEmbed();
        embed.setColor('GREEN')

        if (queu.length <= 1) {
            embed.setTitle("**:cd: The queue is empty.**")
            msg.channel.send(embed);
            console.log(`musc: show queue by ${msg.author.tag}`)
        } else {
            msg.channel.startTyping();
            embed.setTitle("**:cd: Here's the queue:**")

            let n = 1;
            let q = queu.slice(1, 10);
            for await (const song of q) {
                let videoData = await YoutubeStream.getInfo(song)
                if (!videoData) return;
                let date = new Date(null)
                date.setSeconds(parseInt(videoData.videoDetails.lengthSeconds, 10))
                let timeString = date.toISOString().substr(11, 8)
                embed.addField(`${n} : **${Util.escapeMarkdown(videoData.videoDetails.title)}**, *${timeString}*`, song)
                n += 1;
            }

            if (queu.length > 10) embed.setFooter(`and ${(queu.length - 10)} more...`)
            msg.channel.send(embed);
            msg.channel.stopTyping(true);
            console.log(`musc: show queue by ${msg.author.tag}`)
        }
    }

    /**
     * Adds a voteskip
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async skip(bot: Client, msg: Message) {
        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        let voiceConnection = bot.voice.connections.find(val => val.channel.id == voiceChannel.id);
        let queu = queue.get(msg.guild.id);

        if (!queu[0]) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        let skipperz = skippers.get(msg.guild.id) ? skippers.get(msg.guild.id) : []
        if (skipperz.indexOf(msg.author.id) == -1) {
            skipperz.push(msg.author.id);
            skippers.set(msg.guild.id, skipperz);

            let reqs = skipReq.get(msg.guild.id) ? skipReq.get(msg.guild.id) : 0;
            reqs++;
            skipReq.set(msg.guild.id, reqs)

            const embed = new MessageEmbed();
            embed.setColor('GREEN')
            embed.setAuthor("Your voteskip has been registered!", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            msg.channel.send(embed)

            console.log(`info: voteskip by ${msg.author.tag}`)

            if (reqs >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
                let dispatcher = voiceConnection.dispatcher
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("Half of the people have voted, skipping...")
                msg.channel.send(embed)
                loop.set(msg.guild.id, false);
                dispatcher.end()
                console.log(`musc: skipping song`)
            } else {
                const embed = new MessageEmbed();
                embed.setColor('BRIGHT_RED')
                embed.setTitle("You need **" + (Math.ceil((voiceChannel.members.size - 1) / 2) - reqs) + "** more skip vote to skip!")
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
        queue.delete(msg.guild.id)

        await msg.react('✅');

        console.log(`musc: clear queue by ${msg.author.tag}`)
    }

    /**
     * Stops the music
     * @param msg - Message object
     */
    static async stop(msg: Message) {
        let voiceChannel:VoiceChannel = msg.member.voice.channel;

        queue.delete(msg.guild.id)

        await msg.react('✅');
        voiceChannel.leave()
        console.log(`musc: stop by ${msg.author.tag}`)
    }

    /**
     * Forceskips the music
     * (only usable by the staff)
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async forceskip(bot: Client, msg: Message) {
        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        let voiceConnection = bot.voice.connections.find(val => val.channel.id == voiceChannel.id);
        let queu = queue.get(msg.guild.id);

        if (!queu[0]) {
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
        loop.set(msg.guild.id, false);

        dispatcher.end()

        return console.log(`musc: forceskip by ${msg.author.tag}`)
    }

    /**
     * Enables / Disables looping the current song
     * @param msg - Message object
     */
    static loop(msg: Message) {
        let loo = loop.get(msg.guild.id) ? loop.get(msg.guild.id) : false
        if (!loo) {
            loop.set(msg.guild.id, true)
            console.log(`info: loop enabled by ${msg.author.tag}`)
            const embed = new MessageEmbed();
            embed.setAuthor("🔂 Looping the current song...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        } else if (loo) {
            loop.set(msg.guild.id, false)
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
        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        let voiceConnection = bot.voice.connections.find(val => val.channel.id == voiceChannel.id);
        let queu = queue.get(msg.guild.id);

        if (!queu[0]) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        msg.channel.startTyping();
        let videoData = await YoutubeStream.getInfo(queu[0])

        if (!videoData) return;

        let date = new Date(null)
        date.setSeconds(parseInt(videoData.videoDetails.lengthSeconds, 10))
        let timeString = date.toISOString().substr(11, 8)

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setTitle("**:cd: Now Playing:**")

        let desc = `[${Util.escapeMarkdown(videoData.videoDetails.title)}](${queu[0]})`;
        let loo = loop.get(msg.guild.id) ? loop.get(msg.guild.id) : false
        if (loo) desc += "\n🔂 Currently looping this song - type `?loop` to disable";
        embed.setDescription(desc)

        let time = new Date(voiceConnection.dispatcher.streamTime).toISOString().slice(11, 19)
        embed.setFooter(`${time} / ${timeString}`)

        let infos = await yt.getVideo(queu[0]);
        let thumbnail = infos.thumbnails
        embed.setThumbnail(thumbnail.high.url)

        msg.channel.send(embed)
        msg.channel.stopTyping(true);
        console.log(`info: nowplaying by ${msg.author.tag}`)
    }

    /**
     * Pauses the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async pause(bot: Client, msg: Message) {
        let dispatcher = await fetchDispatcher(bot, msg);

        if(dispatcher) {
            dispatcher.pause(false);
            await msg.react('✅');
        }
    }

    /**
     * Resumes the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async resume(bot: Client, msg: Message) {
        let dispatcher = await fetchDispatcher(bot, msg);

        if(dispatcher) {
            dispatcher.resume();
            await msg.react('✅');
        }
    }
}

/**
 * Plays the song in the top of the queue
 * @param msg - Message object
 * @param voiceConnection - Voice connection of the bot
 * @param voiceChannel - The voice channel where the bot should be connected in
 */
async function playSong(msg: Message, voiceConnection: VoiceConnection, voiceChannel: VoiceChannel) {
    let queu = queue.get(msg.guild.id);
    const video = YoutubeStream(queu[0], { filter: "audioonly", quality: "highestaudio", highWaterMark: 1024 });

    video.on('error', () => {
        return msg.channel.send(":x: > **There was an unexpected error with playing the video, please retry later**")
    })

    voiceConnection.play(video, { volume: 0.8, bitrate: 64000, highWaterMark: 48, fec: true, plp: 0 })
        .on('start', async () => {
            let loo = loop.get(msg.guild.id) ? loop.get(msg.guild.id) : false
            if (!loo) {
                let videoData = await YoutubeStream.getInfo(queu[0])
                if (!videoData) return;

                let date = new Date(null)
                date.setSeconds(parseInt(videoData.videoDetails.lengthSeconds, 10))
                let timeString = date.toISOString().substr(11, 8)
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("**:cd: Now Playing:**")
                embed.setDescription(`[${Util.escapeMarkdown(videoData.videoDetails.title)}](${queu[0]})`)
                embed.setFooter(`Length : ${timeString}`)
                let infos = await yt.getVideo(queu[0]);
                let thumbnail = infos.thumbnails
                embed.setThumbnail(thumbnail.high.url)
                msg.channel.send(embed)
                console.log(`musc: playing: ${Util.escapeMarkdown(videoData.videoDetails.title)}`)
            }
        }).on('finish', () => {
            let loo = loop.get(msg.guild.id) ? loop.get(msg.guild.id) : false
            if (!loo) {
                queu.shift()
                queue.set(msg.guild.id, queu)
            }

            if (queu.length == 0) {
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("🚪 Queue finished. Disconnecting...")

                queue.delete(msg.guild.id);
                skipReq.delete(msg.guild.id);
                skippers.delete(msg.guild.id);
                loop.delete(msg.guild.id);

                msg.channel.send(embed)
                voiceChannel.leave();
            } else {
                skipReq.delete(msg.guild.id);
                skippers.delete(msg.guild.id);
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
    let queu = queue.get(msg.guild.id) ? queue.get(msg.guild.id) : [];
    if (queu && !queu.find(song => song === video_url)) {
        data = await YoutubeStream.getInfo(video_url).catch(() => { error = true; })
        if (!error && data) {
            queu.push(video_url)
            queue.set(msg.guild.id, queu)
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

    if (queu[0] != video_url && data) {
        const embed = new MessageEmbed();
        embed.setAuthor('Successfully added to the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        embed.setDescription(`**${data.videoDetails.title}**`)
        embed.setFooter(`Added by ${msg.author.username}`)
        let infos = await yt.getVideo(video_url);
        let thumbnail = infos.thumbnails
        embed.setThumbnail(thumbnail.high.url)
        embed.setColor('LUMINOUS_VIVID_PINK')
        msg.channel.stopTyping()
        await msg.channel.send(embed)
        console.log(`musc: add to queue: ${msg.author.tag} added ${data.videoDetails.title}`)
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
    let voiceChannel:VoiceChannel = msg.member.voice.channel;
    let voiceConnection = bot.voice.connections.find(val => val.channel.id == voiceChannel.id);
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