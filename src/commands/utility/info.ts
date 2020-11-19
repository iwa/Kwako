import Kwako from '../../Client'
import { Message } from 'discord.js'
import GuildConfig from '../../interfaces/GuildConfig';

let { version } = require('../../../package.json')

module.exports.run = async (msg: Message, args: any, guildConf: GuildConfig) => {
    let iwa = await Kwako.users.fetch(process.env.IWA);
    let avatar = iwa.avatarURL({ format: 'png', dynamic: false, size: 256 })

    let embed = {
        "embed": {
            "title": "**About Kwako**",
            "description": `Kwako is developed and handled by iwa#5222.

📘 Language : \`TypeScript\` using NodeJS
📲 API Access : \`discord.js\` package

:grey_question: You can access the commands list by typing \`${guildConf.prefix}help\`

💸 All my work is done for free, but you can still financially support me through [my Patreon page](https://www.patreon.com/iwa)

💛 Big thanks to my Golden Patrons:
${Kwako.getGolden()}`,
            "color": 15909996,
            "footer": {
                "text": `Created with ♥ by iwa | Copyright © iwa, v${version}`
            },
            "thumbnail": {
                "url": avatar
            }
        }
    }

    try {
        Kwako.log.info({msg: 'info', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }});
        await msg.channel.send(embed)
    } catch (ex) {
        Kwako.log.error(ex)
    }
};

module.exports.help = {
    name: 'info',
    aliases: ['about'],
    usage: "info",
    desc: "Show some info about Kwako",
    perms: ['EMBED_LINKS']
};
