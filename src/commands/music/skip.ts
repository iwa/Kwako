import Kwako from '../../Client'
import { Message, MessageEmbed, VoiceChannel } from 'discord.js'

let skippers: Map<string, Set<string>> = new Map();
let skipReq: Map<string, number> = new Map();

module.exports.run = (msg: Message) => {
    let voiceChannel: VoiceChannel = msg.member.voice.channel;
    if(!voiceChannel) return;

    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    if (!player.playing && player.queue.length === 0) {
        const embed = new MessageEmbed()
            .setColor('RED')
            .setTitle("I'm not playing anything right now!")
        return msg.channel.send(embed);
    }

    let skipperList = skippers.get(msg.guild.id) || new Set();
    if (!skipperList.has(msg.author.id)) {
            skipperList.add(msg.author.id);
            skippers.set(msg.guild.id, skipperList);

            let reqs = skipReq.get(msg.guild.id) || 0;
            reqs += 1;
            skipReq.set(msg.guild.id, reqs)

            const embed = new MessageEmbed();
            embed.setColor('GREEN')
            embed.setAuthor("Your voteskip has been registered!", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }))
            msg.channel.send(embed)

            Kwako.log.info({msg: 'voteskip', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})

            if (reqs >= Math.ceil((voiceChannel.members.size - 1) / 2)) {
                const embed = new MessageEmbed();
                embed.setColor('GREEN')
                embed.setTitle("Half of the people have voted, skipping...")
                msg.channel.send(embed)

                player.setTrackRepeat(false);
                player.stop();

                skipReq.delete(msg.guild.id);
                skippers.delete(msg.guild.id);

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
};

module.exports.help = {
    name: 'skip',
    aliases: ['next'],
    usage: "skip",
    desc: "Vote to skip the current played song\nThe half of the people in the voice channel needs to voteskip for skipping the song",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};