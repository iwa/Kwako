import Kwako from '../Client'
import { MessageEmbed, TextChannel } from 'discord.js';

export default async function birthdayCheck() {
    let today = new Date();
    let hh = today.getUTCHours()

    if (hh === 8) {
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let todayString = `${dd}/${mm}`;

        let data = await Kwako.db.collection('user').find({ 'birthday': { $eq: todayString } }).toArray();
        if(!data || data.length === 0) return;

        for(const guild of Kwako.guilds.cache.values()) {
            let channel = guild.channels.cache.find(val => val.type === 'text' && val.name.match(/g(e?)n(e?)r(a?)l/gi) !== null && val.permissionsFor(Kwako.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']));

            if(!channel)
                channel = guild.channels.cache.find(val => val.type === 'text' && val.permissionsFor(Kwako.user.id).has(['SEND_MESSAGES', 'EMBED_LINKS']));

            data.forEach(async user => {
                let userInfo = guild.members.resolve(user._id)
                if(!userInfo) return;

                const embed = new MessageEmbed();
                embed.setTitle(`**Happy Birthday, ${userInfo.user.username}! 🎉🎉**`);
                embed.setFooter(`Born on: ${todayString}`);
                embed.setColor('#FFFF72');
                embed.setThumbnail(userInfo.user.avatarURL({ format: 'png', dynamic: false, size: 128 }));

                (channel as TextChannel).send(`<@${user._id}>`);
                (channel as TextChannel).send(embed);
            });
        }
    }
}