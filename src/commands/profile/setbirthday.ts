import { Client, Message, MessageEmbed } from 'discord.js'
import { Db } from 'mongodb'

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, commands: any, guildConf: any) => {
    if (args.length == 1) {
        let content = args[0]
        if (content.length > 5 || content.length < 3) {
            return msg.channel.send({ "embed": { "title": `:x: > **Date format is invalid ! Please enter your birthday like that :\n${guildConf.prefix}setbirthday mm/dd**`, "color": 13632027 } });
        }

        let date = new Date(content);

        if (date) {
            let dd = String(date.getDate()).padStart(2, '0');
            let mm = String(date.getMonth() + 1).padStart(2, '0');
            let today = `${mm}/${dd}`;
            await db.collection('user').updateOne({ _id: msg.author.id }, { $set: { birthday: today } }, { upsert: true });
            const embed = new MessageEmbed();
            embed.setAuthor("Your birthday is now set to: ", msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 }));
            embed.setTitle(`**${today}**`)
            embed.setFooter('(mm/dd)')
            embed.setColor('AQUA')

            try {
                console.log(`info: birthday of ${msg.author.tag} set on ${today}`)
                return await msg.channel.send(embed);
            } catch (err) {
                console.error(err);
            }
        } else
            return msg.channel.send({ "embed": { "title": ":x: > **Date format is invalid! Please enter your birthday in mm/dd format.", "color": 13632027 } });

    } else
        return msg.channel.send({ "embed": { "title": ":x: > **Date format is invalid! Please enter your birthday in mm/dd format.", "color": 13632027 } });
};

module.exports.help = {
    name: 'setbirthday',
    usage: "setbirthday (your birthday, mm/dd)",
    desc: "Register your birthday to Kwako.\nPlease enter in **mm/dd** format.\nThis uses UTC timezone."
};