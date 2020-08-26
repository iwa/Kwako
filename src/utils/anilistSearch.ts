import { Message } from "discord.js";

let number = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'];

export default async function anilistSearch(msg: Message, data: { media: any[]; }) {
    let desc = "";

    for(let i = 0; i < data.media.length; i++)
        desc = `${desc}${number[i]} ${data.media[i].title.romaji}\n`

    let sent = await msg.channel.send({
        "embed": {
          "title": "🔍",
          "description": desc,
          "color": 4886754
        }
    });

    for(let i = 0; i < data.media.length; i++)
        await sent.react(number[i])

    let collected = await sent.awaitReactions((_reaction, user) => (['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣'].includes(_reaction.emoji.name)) && (user.id === msg.author.id), { max: 1, time: 30000 })

    sent.delete();
    if (collected.first() === undefined) return;

    let emote = collected.first().emoji.name

    let res;
    switch (emote) {
        case '1️⃣':
            if(!data.media[0]) return;
            res = data.media[0];
        break;

        case '2️⃣':
            if(!data.media[1]) return;
            res = data.media[1];
        break;

        case '3️⃣':
            if(!data.media[2]) return;
            res = data.media[2];
        break;

        case '4️⃣':
            if(!data.media[3]) return;
            res = data.media[3];
        break;

        case '5️⃣':
            if(!data.media[4]) return;
            res = data.media[4];
        break;

        default:
            return;
    }

    return res;
}