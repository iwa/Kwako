import Kwako from '../../Client'
import { Message } from 'discord.js'
import { loadImage } from 'canvas'

module.exports.run = async (msg: Message, args: string[], guildConf: GuildConfig) => {
    let attachment = msg.attachments.first();

    if (args.length !== 1 && !attachment) return msg.channel.send({
        "embed": {
          "description": `\`${guildConf.prefix}setbackground (url)\` to set an image background in your profile card\n\n\`${guildConf.prefix}setbackground off\` to disable it and use the colored background back`,
          "color": 11462520
        }
    })

    let url = args[0];

    if(url === "off") {
        await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, {$set: { background: null }}, { upsert: true });
        if (msg.deletable) {
            try {
                await msg.delete()
            } catch (ex) {
                Kwako.log.error(ex)
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

    if(attachment) {
        let fileName = attachment.name.split('.')
        let name = `${msg.author.id}.${fileName.pop()}`
        await download(msg.attachments.first().proxyURL, `image/${name}`);
        url = `image/${name}`
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

    await Kwako.db.collection('user').updateOne({ _id: msg.author.id }, {
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
            Kwako.log.error(ex)
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

        Kwako.log.info({msg: 'setbackground', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, image: url });
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
    if(width >= height) {
        goodWidth = width;
        for(let j = 0; j <= height; j += 1) {
            if(Math.abs((width / j) - (1016 / 356)) < 0.5) {
                goodHeight = j;
            }
        }
    } else {
        goodHeight = height;
        for(let i = 0; i <= width; i += 1) {
            if((i / height) === 2.8539) {
                goodWidth = i;
            }
        }
    }

    return { width: goodWidth, height: goodHeight };
}

import fs from 'fs'
import axios from 'axios'
import GuildConfig from '../../interfaces/GuildConfig';

async function download(url: string, filename: string) {
    //let bar = new Promise((resolve, reject) => {
    //    request.head(uri, function(err: any, res: { headers: { [x: string]: any; }; }, body: any) {
    //        request(uri).pipe(fs.createWriteStream(filename)).on('close', () => { resolve() });
    //    });
    //});
    //return bar;

    const writer = fs.createWriteStream(filename)

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
};