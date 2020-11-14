import Kwako from '../../Client'
import { Message, MessageEmbed, Util } from 'discord.js'

module.exports.run = async (msg: Message, args: string[]) => {
    const voiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return msg.channel.send({'embed':{
        'title': ':x: You need to be in a voice channel in order to use this command'
    }});

    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if(player.voiceChannel !== voiceChannel.id) return msg.channel.send({'embed':{
        'title': ':x: You need to be connected in the same voice channel as me to use this command'
    }});

    player.connect();

    let video_url = args[0].split('&')

    if (video_url[0].match(/^https?:\/\/(((www|m)\.)youtube.com)\/playlist(.*)$/)) {
        let res = await Kwako.music.search(args.join(), msg.author);

        player.queue.add(res.tracks);

        let playlist = res.playlist;

        if(playlist) {
            const embed = new MessageEmbed()
                .setAuthor('Successfully added to the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
                .setDescription(`Playlist: **${playlist.name}**`)
                .setFooter(`Added by ${msg.author.username}`)
                .setColor('LUMINOUS_VIVID_PINK');

            await msg.channel.send(embed)
        }
    } else {
        let res = await Kwako.music.search(args.join(' '), msg.author);

        player.queue.add(res.tracks[0]);

        const embed = new MessageEmbed()
            .setAuthor('Successfully added to the queue:', msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            .setDescription(`**${res.tracks[0].title}**`)
            .setFooter(`Added by ${msg.author.username}`)
            .setThumbnail(res.tracks[0].thumbnail)
            .setColor('LUMINOUS_VIVID_PINK');

        await msg.channel.send(embed)
        Kwako.log.info({msg: 'music added to queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, song: { name: Util.escapeMarkdown(res.tracks[0].title), url: res.tracks[0].uri}});
    }

    if (!player.playing) player.play();
};

module.exports.help = {
    name: 'play',
    aliases: ['add', 'p'],
    usage: "play (YouTube link | keywords)",
    desc: "Play YouTube videos in a voice channel",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};