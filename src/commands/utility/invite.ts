import { Client, Message } from 'discord.js';

module.exports.run = async (bot: Client, msg: Message) => {
    await msg.channel.send({
        "embed": {
          "title": "You can invite me to your server through this link:",
          "description": "https://iwa.sh/Kwako",
          "color": 16774804}
        })
        .then(() => { console.log(`info: ping: ${msg.author.tag}`) })
        .catch(console.error);
};

module.exports.help = {
    name: 'invite',
    usage: "invite",
    desc: "This will send you a link to add me into your server!"
};