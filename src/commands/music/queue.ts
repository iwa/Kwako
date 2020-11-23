import Kwako from '../../Client'
import { Message, MessageEmbed, Util } from 'discord.js'

module.exports.run = async (msg: Message) => {
    const player = Kwako.music.create({
        guild: msg.guild.id,
        voiceChannel: msg.member.voice.channel.id,
        textChannel: msg.channel.id,
    });

    let queue = player.queue;
    if (queue.size < 0) return;

    const embed = new MessageEmbed();
    embed.setColor('GREEN')

    if (queue.size <= 1) {
        embed.setTitle("**:cd: The queue is empty.**")
        msg.channel.send(embed);
        Kwako.log.info({msg: 'queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
    } else {
        msg.channel.startTyping();
        embed.setTitle("**:cd: Music Queue**")

        let n = 1;
        let q = queue.slice(0, 9);

        let timeString;
        if(!queue['current'].isStream) {
            let date = new Date(queue['current'].duration);
            timeString = date.toISOString().substr(11, 8)
        } else
            timeString = '🔴 Livestream'

        let desc = `🎶 [${Util.escapeMarkdown(queue['current'].title)}](${queue['current'].uri}), *${timeString}*\n\n`;
        for await (const song of q) {
            let timeString;
            if(!song.isStream) {
                let date = new Date(song.duration);
                timeString = date.toISOString().substr(11, 8)
            } else
                timeString = '🔴 Livestream'

            desc = `${desc}${n}. [${Util.escapeMarkdown(song.title)}](${song.uri}), *${timeString}*\n`;
            n += 1;
        }

        embed.setDescription(desc);

        if (queue.size > 10) {
            let footer = `and ${(queue.size - 10)} more...`;
            let looqueue = player.queueRepeat || false
            if (looqueue) footer += " | Currently looping the queue - type `?loopqueue` to disable";
            embed.setFooter(footer)
        }

            let looqueue = player.queueRepeat || false
            if (looqueue) embed.setFooter("Currently looping the queue - type `?loopqueue` to disable");

            msg.channel.send(embed);
            msg.channel.stopTyping(true);
            Kwako.log.info({msg: 'queue', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
        }
};

module.exports.help = {
    name: 'queue',
    aliases: ['q'],
    usage: "queue",
    desc: "Show the music queue",
    perms: ['EMBED_LINKS', 'CONNECT', 'SPEAK', 'USE_VAD']
};