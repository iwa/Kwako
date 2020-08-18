import Kwako from '../../Client'
import { Message } from 'discord.js'

let { version } = require('../../../package.json')

module.exports.run = async (msg: Message, args: any, guildConf: any) => {
    let iwa = await Kwako.users.fetch(process.env.IWA);
    let avatar = iwa.avatarURL({ format: 'png', dynamic: false, size: 256 })

    let embed = {
        "embed": {
            "title": "**Bot Infos**",
            "description": `Kwako is developed and handled by <@125325519054045184>.\n\nLanguage : \`TypeScript\` using NodeJS\nAPI Access : \`discord.js\` package\n\nYou can access to the index of commands by typing \`${guildConf.prefix}help\`\n\nAll my work is done for free, but you can still financially support me [here](https://www.patreon.com/iwa)`,
            "color": 13002714,
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
    usage: "info",
    desc: "Show some info about Kwako",
    perms: ['EMBED_LINKS']
};
