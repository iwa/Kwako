import { Client, Message, Collection } from 'discord.js';
import { Db } from 'mongodb';
let commands = new Map();
let member = {}, mod = {};

import * as fs from 'fs';

readDirs()
setTimeout(() => {
    member = {
        "embed": {
            "title": "__**Commands**__",
            "description": "Prefix : `?`\nUse `?help (command)` to have more info about a specific command",
            "color": 3852663,
            "fields": [
                {
                    "name": "**👤 Profile**",
                    "value": commands.get("profile")
                },
                {
                    "name": "**💕 Actions**",
                    "value": commands.get("actions")
                },
                {
                    "name": "**🕹 Games**",
                    "value": commands.get("games")
                },
                {
                    "name": "**🎶 Music**",
                    "value": commands.get("music")
                },
                {
                    "name": "**🛠 Utility**",
                    "value": commands.get("utility")
                },
            ]
        }
    }
    mod = {
        "embed": {
            "title": "**⚔️ Staff**",
            "description": commands.get("staff"),
            "color": 4886754
        }
    }
}, 5000)

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, commands: Collection<any, any>, settings:Map<string, Object>) => {
    if (args.length == 1) {
        let cmd = commands.get(args[0]);
        if (!cmd || !cmd.help.usage) return;
        if (cmd.help.staff && !msg.member.hasPermission('MANAGE_GUILD')) return;

        let config:any = settings.get(msg.guild.id);

        await msg.channel.send("`Syntax : ( ) is needed argument, [ ] is optional argument`")
        return msg.channel.send(`\`\`\`markdown\n< ${cmd.help.name} >\n\n# Usage\n${config.prefix}${cmd.help.usage}\n\n# Description\n${cmd.help.desc}\`\`\``);
    } else
        sendHelp(msg);
    console.log(`info: help sent to ${msg.author.tag}`)
}

module.exports.help = {
    name: 'help',
    usage: "?help",
    desc: "Well... Obviously it sends you the list of the commands"
};

async function sendHelp(msg: Message) {
    if (msg.member.hasPermission('MANAGE_GUILD'))
        try {
            await msg.author.send(member)
            await msg.author.send(mod)
        } catch (ex) {
            return msg.channel.send(":x: > **Please open your DMs, I can't reach you**")
        }
    else
        try {
            await msg.channel.send(member)
        } catch {
            return msg.channel.send(":x: > **Commands list loading, redo the commands in a few seconds!**")
        }
}

async function readDirs() {
    fs.readdir('./build/commands/', { withFileTypes: true }, async (error, f) => {
        if (error) return console.error(error);
        f.forEach((f) => {
            if (f.isDirectory()) {
                fs.readdir(`./build/commands/${f.name}/`, async (error, fi) => {
                    if (error) return console.error(error);
                    let string: string = "";
                    fi.forEach(async (fi) => {
                        string = `${string}\`${fi.slice(0, -3)}\` `;
                    })
                    commands.set(f.name, string);
                })
            }
        });
    });
}
