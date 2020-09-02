/**
 * Youtube Music Module
 * @packageDocumentation
 * @module Music
 * @category Utils
 */
import Kwako from '../Client';
import { Message, MessageEmbed, Util, VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';
import ytdl from 'ytdl-core';
import { YouTube, Video, Playlist } from 'popyt';
const yt = new YouTube(process.env.YT_TOKEN)

let queue:Map<string, string[]> = new Map();
let skippers:Map<string, string[]> = new Map();
let skipReq:Map<string, number> = new Map();
let loop:Map<string, boolean> = new Map();
let loopqueue:Map<string, boolean> = new Map();

export default class music {

    /**
     * Parses the request (keywords or link)
     * and try to play the video
     * @param bot - Discord Client object
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async play(msg: Message, args: string[]) {
        if (!args[0]) return;

        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        if (voiceChannel == null) return;
        if (!voiceChannel.members.find((val: any) => val.id == msg.author.id)) return msg.channel.send(":x: > **You need to be connected in a voice channel before I join it !**")

        let video_url = args[0].split('&')
        let playlist = await yt.getPlaylist(args[0]).catch(() => {return});

        if (playlist && !video_url[0].match(/^https?:\/\/(((www|m)\.)youtube.com)\/playlist(.*)$/)) {
            let reply = await msg.channel.send({
                "embed": {
                  "title": ":information_source: Your link contains both a video & a playlist link",
                  "description": "Do you want to:\n\n:one: Add the song only\n:two: Add the entire playlist",
                  "color": 15135077,
                  "footer": {
                    "text": `(playlist contains ${playlist.data.contentDetails.itemCount} videos)`
                  }
                }
              })
            await reply.react('1️⃣');
            await reply.react('2️⃣');

            let collected = await reply.awaitReactions((_reaction, user) => (_reaction.emoji.name === '1️⃣' || _reaction.emoji.name === '2️⃣' || _reaction.emoji.name === '❌') && (user.id === msg.author.id), { max: 1, time: 10000 })

            if (collected.first() == undefined) {
                reply.delete()
                return msg.channel.send(":x: > **You didn't choose anything, request cancelled...**")
            }

            let emote = collected.first().emoji.name

            reply.delete();
            if (emote === '2️⃣')
                return addPlaylistToQueue(msg, playlist, voiceChannel);
        }

        if (video_url[0].match(/^https?:\/\/(((www|m)\.)youtube.com)\/playlist(.*)$/)) {

            const playlist = await yt.getPlaylist(video_url[0]).catch(Kwako.log.error)
            if (!playlist) return;

            let reply = await msg.channel.send({
                "embed": {
                  "title": ":warning:",
                  "description": `Are you sure you want to add all the videos of __${playlist.title}__ to the queue ?`,
                  "color": 16312092,
                  "footer": {
                    "text": `(${playlist.data.contentDetails.itemCount} videos)`
                  }
                }
              })
            await reply.react('✅');
            await reply.react('❌');

            let collected = await reply.awaitReactions((_reaction, user) => (_reaction.emoji.name === '✅' || _reaction.emoji.name === '❌') && (user.id === msg.author.id), { max: 1, time: 10000 })

            if (collected.first() == undefined) {
                reply.delete()
                return msg.channel.send(":x: > **You didn't choose anything, request cancelled...**")
            }
            if (collected.find(val => val.emoji.name == '✅') && collected.find(val => val.emoji.name == '❌')) {
                reply.delete()
                return msg.channel.send(":x: > **You must choose only one of both reactions!**")
            }

            let emote = collected.first().emoji.name

            if (emote != '✅') return reply.delete();

            reply.delete()
            await addPlaylistToQueue(msg, playlist, voiceChannel);
        } else {
            if (ytdl.validateURL(video_url[0])) {
                launchPlay(msg, voiceChannel, video_url[0])
            } else {
                let keywords = args.join(' ')

                let video = await yt.searchVideos(keywords, 1).then((data: any) => {
                    if(data && data.results)
                        return data.results[0].url;
                    else
                        return null;
                })

                if (!video) return;
                if (!ytdl.validateURL(video)) return;

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
        let queueID: number = parseInt(args[0], 10);

        if (isNaN(queueID)) return;
        if (queueID < 1) return;
        let queu = queue.get(msg.guild.id);

        let data = await yt.getVideo(queu[queueID])

        if (!data) return;

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setAuthor('Removed from the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
        embed.setDescription(`**${data.title}**`)
        embed.setFooter(`Removed by ${msg.author.username}`)

        msg.channel.send(embed)

        Kwako.log.info({msg: 'remove', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, song: { title: data.title, url: data.shortUrl }});
        queu.splice(queueID, 1);
        queue.set(msg.guild.id, queu);
    }

    /**
     * Sends the queue
     * @param msg - Message object
     * @param args - Arguments in the message
     */
    static async list(msg: Message) {
        let queu = queue.get(msg.guild.id) || [];
        if (queu.length < 0) return;

        const embed = new MessageEmbed();
        embed.setColor('GREEN')

        if (queu.length <= 1) {
            embed.setTitle("**:cd: The queue is empty.**")
            msg.channel.send(embed);
            Kwako.log.info({msg: 'queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
        } else {
            msg.channel.startTyping();
            embed.setTitle("**:cd: Music Queue**")

            let n = 1;
            let q = queu.slice(1, 10);

            let videoData = await yt.getVideo(queu[0]);
            let date = new Date(0);
            date.setSeconds((videoData.minutes * 60) + videoData.seconds)
            let timeString = date.toISOString().substr(11, 8)
            let desc = `🎶 [${Util.escapeMarkdown(videoData.title)}](${queu[0]}), *${timeString}*\n\n`;
            for await (const song of q) {
                let videoData = await yt.getVideo(song);
                if (!videoData) return;
                let date = new Date(0);
                date.setSeconds((videoData.minutes * 60) + videoData.seconds)
                let timeString = date.toISOString().substr(11, 8)
                desc = `${desc}${n}. [${Util.escapeMarkdown(videoData.title)}](${song}), *${timeString}*\n`;
                n += 1;
            }

            embed.setDescription(desc);

            if (queu.length > 10) {
                let footer = `and ${(queu.length - 10)} more...`;
                let looqueue = loopqueue.get(msg.guild.id) || false
                if (looqueue) footer += " | Currently looping the queue - type `?loopqueue` to disable";
                embed.setFooter(footer)
            }

            let looqueue = loopqueue.get(msg.guild.id) || false
            if (looqueue) embed.setFooter("Currently looping the queue - type `?loopqueue` to disable");

            msg.channel.send(embed);
            msg.channel.stopTyping(true);
            Kwako.log.info({msg: 'queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
        }
    }

    /**
     * Adds a voteskip
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async skip(msg: Message) {
        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        if(!voiceChannel) return;

        let voiceConnection = Kwako.voice.connections.find(val => val.channel.id === voiceChannel.id);
        if(!voiceConnection) return;

        let queu = queue.get(msg.guild.id);

        if (!queu) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        let skipperz = skippers.get(msg.guild.id) || []
        if (skipperz.indexOf(msg.author.id) == -1) {
            skipperz.push(msg.author.id);
            skippers.set(msg.guild.id, skipperz);

            let reqs = skipReq.get(msg.guild.id) || 0;
            reqs += 1;
            skipReq.set(msg.guild.id, reqs)

            const embed = new MessageEmbed();
            embed.setColor('GREEN')
            embed.setAuthor("Your voteskip has been registered!", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            msg.channel.send(embed)

            Kwako.log.info({msg: 'voteskip', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})

            if (reqs >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
                let dispatcher = voiceConnection.dispatcher
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("Half of the people have voted, skipping...")
                msg.channel.send(embed)
                loop.set(msg.guild.id, false);
                dispatcher.end()
                Kwako.log.info({msg: 'skipping song', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
            } else {
                const embed = new MessageEmbed();
                embed.setColor('BRIGHT_RED')
                embed.setTitle(`You need **${(Math.ceil((voiceChannel.members.size - 1) / 2) - reqs)}** more skip vote to skip!`)
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

        Kwako.log.info({msg: 'clear', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    }

    /**
     * Stops the music
     * @param msg - Message object
     */
    static async stop(msg: Message) {
        let dispatcher = await fetchDispatcher(msg);

        if(dispatcher) {
            let voiceChannel: VoiceChannel = msg.member.voice.channel;

            queue.delete(msg.guild.id)

            await msg.react('✅');
            voiceChannel.leave()
            Kwako.log.info({msg: 'stop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
        }
    }

    /**
     * Stops the music
     * @param voiceChannel - VoiceChannel object
     */
    static async stopAlone(voiceChannel: VoiceChannel) {
        if (!voiceChannel) return;

        let voiceConnection = Kwako.voice.connections.find(val => val.channel.id === voiceChannel.id);
        let dispatcher;
        if (voiceConnection)
            dispatcher = voiceConnection.dispatcher;

        if(dispatcher) {
            queue.delete(voiceChannel.guild.id)

            voiceChannel.leave();
            Kwako.log.info({msg: 'auto stop', guild: { id: voiceChannel.guild.id, name: voiceChannel.guild.name }})
        }
    }

    /**
     * Forceskips the music
     * (only usable by the staff)
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async forceskip(msg: Message) {
        let voiceChannel:VoiceChannel = msg.member.voice.channel;
        let voiceConnection = Kwako.voice.connections.find(val => val.channel.id == voiceChannel.id);
        let queu = queue.get(msg.guild.id);

        if (!queu) {
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

        return Kwako.log.info({msg: 'forceskip', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    }

    /**
     * Enables / Disables looping the current song
     * @param msg - Message object
     */
    static loop(msg: Message) {
        let loo = loop.get(msg.guild.id) || false
        if (!loo) {
            loop.set(msg.guild.id, true)
            Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: true})
            const embed = new MessageEmbed();
            embed.setAuthor("🔂 Looping the current song...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        } else if (loo) {
            loop.set(msg.guild.id, false)
            Kwako.log.info({msg: 'loop', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: false})
            const embed = new MessageEmbed();
            embed.setAuthor("This song will no longer be looped...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        }
    }

    static loopqueue(msg: Message) {
        let loo = loopqueue.get(msg.guild.id) || false
        if (!loo) {
            loopqueue.set(msg.guild.id, true)
            Kwako.log.info({msg: 'loopqueue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: true})
            const embed = new MessageEmbed();
            embed.setAuthor("🔁 Looping the queue...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        } else if (loo) {
            loopqueue.set(msg.guild.id, false)
            Kwako.log.info({msg: 'loopqueue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, enable: false})
            const embed = new MessageEmbed();
            embed.setAuthor("The queue will no longer be looped...", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setColor('GREEN')
            return msg.channel.send(embed)
        }
    }

    /**
     * Shows the current played song
     * @param msg - Message object
     * @param bot - Discord Client object
     */
    static async np(msg: Message) {
        let voiceConnection = Kwako.voice.connections.find(val => val.channel.guild.id === msg.guild.id);
        let queu = queue.get(msg.guild.id);

        if (!queu) {
            const embed = new MessageEmbed();
            embed.setColor('RED')
            embed.setTitle("I'm not playing anything right now!")
            return msg.channel.send(embed);
        }

        msg.channel.startTyping();
        let videoData = await yt.getVideo(queu[0]);

        if (!videoData) return;

        let date = new Date(0);
        date.setSeconds((videoData.minutes * 60) + videoData.seconds)
        let timeString = date.toISOString().substr(11, 8)

        const embed = new MessageEmbed();
        embed.setColor('GREEN')
        embed.setTitle("**:cd: Now Playing:**")

        let desc = `[${Util.escapeMarkdown(videoData.title)}](${queu[0]})`;

        let loo = loop.get(msg.guild.id) || false
        if (loo) desc += "\n🔂 Currently looping this song - type `?loop` to disable";

        let looqueue = loopqueue.get(msg.guild.id) || false
        if (looqueue) desc += "\n🔁 Currently looping the queue - type `?loopqueue` to disable";

        embed.setDescription(desc)

        let time = new Date(voiceConnection.dispatcher.streamTime).toISOString().slice(11, 19)
        embed.setFooter(`${time} / ${timeString}`)

        let infos = await yt.getVideo(queu[0]);
        let thumbnail = infos.thumbnails
        embed.setThumbnail(thumbnail.high.url)

        msg.channel.send(embed)
        msg.channel.stopTyping(true);
        Kwako.log.info({msg: 'nowplaying', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    }

    /**
     * Pauses the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async pause(msg: Message) {
        let dispatcher = await fetchDispatcher(msg);

        if(dispatcher) {
            dispatcher.pause(false);
            await msg.react('✅');
        }

        Kwako.log.info({msg: 'pause', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    }

    /**
     * Resumes the music
     * @param bot - Discord Client object
     * @param msg - Message object
     */
    static async resume(msg: Message) {
        let dispatcher = await fetchDispatcher(msg);

        if(dispatcher) {
            dispatcher.resume();
            await msg.react('✅');
        }

        Kwako.log.info({msg: 'resume', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    }

    static async shuffle(msg: Message) {
        let dispatcher = await fetchDispatcher(msg);

        if(dispatcher) {
            let queu = queue.get(msg.guild.id) || [];

            if (queu.length <= 2) return msg.react('❌');

            let current = queu.shift();

            for (let i = 0; i < 3; i++)
                queu.sort(() => Math.random() - 0.5);

            queu.unshift(current);

            queue.set(msg.guild.id, queu)
            await msg.react('✅');
        }

        Kwako.log.info({msg: 'shuffle', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
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
    const video = ytdl(queu[0], { filter: "audioonly", quality: "highestaudio", highWaterMark: (16384 * 1024) }).on('error', Kwako.log.error);

    video.on('error', err => {
        Kwako.log.error(err);
        let dispatcher = voiceConnection.dispatcher
        loop.set(msg.guild.id, false);
        dispatcher.end()
        return msg.channel.send(":x: > **There was an unexpected error while playing the video**")
    })

    voiceConnection.play(video, { volume: 0.8, bitrate: 76, highWaterMark: 256, fec: true, plp: 0 })
        .on('start', async () => {
            let loo = loop.get(msg.guild.id) || false
            if (!loo) {
                let videoData = await yt.getVideo(queu[0]);
                if (!videoData) return;

                let date = new Date(0);
                date.setSeconds((videoData.minutes * 60) + videoData.seconds)
                let timeString = date.toISOString().substr(11, 8)
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("**:cd: Now Playing:**")
                embed.setDescription(`[${Util.escapeMarkdown(videoData.title)}](${queu[0]})`)
                embed.setFooter(`Length: ${timeString}`)
                let infos = await yt.getVideo(queu[0]);
                let thumbnail = infos.thumbnails
                embed.setThumbnail(thumbnail.high.url)
                msg.channel.send(embed)
                Kwako.log.info({msg: 'music playing', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, song: { name: Util.escapeMarkdown(videoData.title), url: videoData.shortUrl}});
            }
        }).on('finish', () => {
            let loo = loop.get(msg.guild.id) || false
            let looqueue = loopqueue.get(msg.guild.id) || false
            if (!loo) {
                let lastPlayed = queu.shift();
                if(looqueue)
                    queu.push(lastPlayed);

                queue.set(msg.guild.id, queu)
            }

            if (queu.length === 0) {
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("🚪 Queue finished. Disconnecting...")

                queue.delete(msg.guild.id);
                skipReq.delete(msg.guild.id);
                skippers.delete(msg.guild.id);
                loop.delete(msg.guild.id);
                loopqueue.delete(msg.guild.id);

                msg.channel.send(embed)
                voiceChannel.leave();
            } else {
                skipReq.delete(msg.guild.id);
                skippers.delete(msg.guild.id);
                playSong(msg, voiceConnection, voiceChannel)
            }
        }).on('error', Kwako.log.error);
}

/**
 * Parses the top video in the queue
 * and check if the video is playable
 * @param msg - Message object
 * @param voiceChannel - The voice channel where the bot should be connected in
 * @param video_url - The video url to check and play
 * @param data - Youtube Stream data infos
 */
async function launchPlay(msg: Message, voiceChannel: VoiceChannel, video_url: string) {
    msg.channel.startTyping();
    let error = false, data;
    let queu = queue.get(msg.guild.id) || [];
    if (queu && !queu.find(song => song === video_url)) {
        data = await ytdl.getBasicInfo(video_url).catch(err => { Kwako.log.error(err); error = true; })
        if (!error && data) {
            video_url = data.videoDetails.video_url
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
        Kwako.log.info({msg: 'music added to queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, song: { name: Util.escapeMarkdown(data.videoDetails.title), url: data.videoDetails.video_url}});
    }
    else {
        msg.channel.stopTyping()
        try {
            const voiceConnection = await voiceChannel.join();
            playSong(msg, voiceConnection, voiceChannel);
        }
        catch (ex) {
            Kwako.log.error(ex)
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
async function fetchDispatcher(msg: Message): Promise<StreamDispatcher> {
    let voiceChannel:VoiceChannel = msg.member.voice.channel;
    if (!voiceChannel) {
        const embed = new MessageEmbed();
        embed.setColor('RED')
        embed.setTitle("You need to be connected in the VC where I'm playing music to use this command!")
        await msg.channel.send(embed);
        return;
    }

    let voiceConnection = Kwako.voice.connections.find(val => val.channel.id === voiceChannel.id);
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


async function addPlaylistToQueue(msg: Message, playlist: Playlist, voiceChannel: VoiceChannel) {
    const embed = new MessageEmbed();
    embed.setTitle("Adding all the playlist's videos to the queue...")
    embed.setFooter(`Added by ${msg.author.username}`)
    embed.setColor('LUMINOUS_VIVID_PINK')
    msg.channel.send(embed)

    let videos = await playlist.fetchVideos(0);
    let errors = 0;

    let bar = new Promise((resolve) => {
        let queu = queue.get(msg.guild.id) || [];
        videos.forEach(async (video: Video, index: number, array: Video[]) => {
            let url = video.url
            if (!queu.find(song => song === url))
                queu.push(url)

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

        let connection: null | VoiceConnection = Kwako.voice.connections.find(val => val.channel.id === voiceChannel.id);

        if (!connection) {
            try {
                const voiceConnection = await voiceChannel.join();
                playSong(msg, voiceConnection, voiceChannel);
            }
            catch (ex) {
                Kwako.log.error(ex)
            }
        }
    });
}