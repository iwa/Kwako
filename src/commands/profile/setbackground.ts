import { Client, Message } from 'discord.js'
import { Db } from 'mongodb'
import { loadImage } from 'canvas';

module.exports.run = async (bot: Client, msg: Message, args: string[], db: Db, commands: any, guildConf: any) => {
    if (args.length !== 1) return msg.channel.send({
        "embed": {
          "description": `\`${guildConf.prefix}setbackground (url)\` to set an image background in your profile card\n\n\`${guildConf.prefix}setbackground off\` to disable it and use the colored background back`,
          "color": 11462520
        }
      })

    let url = args[0];

    if(url === "off") {
        await db.collection('user').updateOne({ _id: msg.author.id }, {$set: { background: null }}, { upsert: true });
        if (msg.deletable) {
            try {
                await msg.delete()
            } catch (ex) {
                console.error(ex)
            }
        }
        return msg.channel.send({
            "embed": {
              "author": {
                "name": "✅ Your background image has been disabled",
                "icon_url": msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 })
              },
              "color": 15431286
            }
          })
    }

    let image = await loadImage(url).catch(() => {
        msg.channel.send({
            "embed": {
              "author": {
                "name": "❌ There's a problem with your image",
                "icon_url": msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 })
              },
              "description": "Make sure your link is still working fine",
              "color": 13632027
            }
          });
    });

    if (!image) return;

    let res = findRes(image.width, image.height);

    await db.collection('user').updateOne({ _id: msg.author.id }, {
        $set: {
            background: {
                url: url,
                width: res.width,
                height: res.height
            }
        }
    }, { upsert: true });

    if (msg.deletable) {
        try {
            await msg.delete()
        } catch (ex) {
            console.error(ex)
        }
    }

    await msg.channel.send({
            "embed": {
              "author": {
                "name": "✅ Your background image has been changed",
                "icon_url": msg.author.avatarURL({ format: 'png', dynamic: false, size: 128 })
              },
              "color": 8311585
            }
          })
};

module.exports.help = {
    name: 'setbackground',
    aliases: ['setbg'],
    usage: "setbackground (url)",
    desc: "Change your profile card background to an image",
    perms: ['SEND_MESSAGES', 'ATTACH_FILES']
};

function findRes(width: number, height: number) {
    let goodWidth = 0, goodHeight = 0;
    for(let i = 0; i <= width; i += 25) {
        for(let j = 0; j <= height; j += 8) {
            if((i / j) === 3.125) {
                goodWidth = i;
                goodHeight = j;
            }
        }
    }
    return { width: goodWidth, height: goodHeight };
}