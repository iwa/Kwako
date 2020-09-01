import Kwako from '../../Client';
import { Message, TextChannel } from 'discord.js';

const twitch = require('twitch').default;
const twitchClient = twitch.withClientCredentials(process.env.TWITCHCLIENTID, process.env.TWITCHCLIENTSECRET);

module.exports.run = async (msg: Message, args: string[], guildConf: any) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return;

    if (args.length === 0) return msg.channel.send({'embed':{
        'title': `\`${guildConf.prefix}twitch (add|remove|list)\``
    }});

    switch (args[0]) {
        // Add
        case 'add':
            if (args.length < 2) return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}twitch add (streamer username)\``
            }});

            let user = await twitchClient.helix.users.getUserByName(args[1]);
            if (!user)
                return msg.channel.send({'embed':{
                    'title': ":x: This streamer doesn't exist!"
                }});

            let channelID = msg.channel.id;

            let streamer = await Kwako.db.collection('twitch').findOne({ _id: args[1] });
            if (streamer) {
                let channels: Array<string> = streamer.channels || [];
                if (channels.indexOf(channelID) > -1) return msg.channel.send({'embed':{
                    'title': ":x: There's already a notification set-up in this channel for this streamer"
                }});
            }

            await Kwako.db.collection('twitch').updateOne({_id: args[1]}, { $push: { channels: channelID }}, { upsert: true });

            Kwako.log.info({msg: 'twitch add', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, data: { streamer: args[1], channel: channelID }})
        return;

        // Remove
        case 'remove':
            if (args.length < 2) return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}twitch remove (level number)\``
            }});

            let channelIDRemove = msg.channel.id;

            let removeStreamer = await Kwako.db.collection('twitch').findOne({ _id: args[1] });
            if (removeStreamer) {
                let channels: Array<string> = removeStreamer.channels || [];
                if (channels.indexOf(channelIDRemove) === -1) return msg.channel.send({'embed':{
                    'title': ":x: There's already no notification set-up in this channel for this streamer"
                }});
            }

            await Kwako.db.collection('twitch').updateOne({_id: args[1]}, { $pull: { channels: channelIDRemove }}, { upsert: true });

            Kwako.log.info({msg: 'twitch remove', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, data: { streamer: args[1], channel: channelIDRemove }})
        return;

        // List
        case 'list':
            let list = `#${(msg.channel as TextChannel).name}\n\n`;

            let channelIDList = msg.channel.id;

            let streamerList = await Kwako.db.collection('twitch').find({ channels: channelIDList }).toArray();

            for(const data of streamerList) {
                list = `${list}${data._id}\n`;
            }

            if(streamerList.length === 0)
                list = `#${(msg.channel as TextChannel).name}\n\nnothing!`

            await msg.channel.send({ "embed": {
                "title": "📃 Stream Notifications List",
                "description": `\`\`\`${list}\`\`\``
            }});

            Kwako.log.info({msg: 'twitch list', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }, channel: channelIDList })
        return;

        default:
            return msg.channel.send({'embed':{
                'title': `\`${guildConf.prefix}twitch (add|remove|list)\``
            }});
    }
};

module.exports.help = {
    name: 'twitch',
    usage: "levelrole (add|remove|list)",
    staff: true,
    perms: ['EMBED_LINKS', 'ADD_REACTIONS', 'MANAGE_ROLES', 'MANAGE_MESSAGES'],
    premium: true
};