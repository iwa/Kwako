import Kwako from '../../Client';
import { Message, TextChannel } from 'discord.js';

import { ApiClient } from 'twitch';
import { ClientCredentialsAuthProvider } from 'twitch-auth';
const authProvider = new ClientCredentialsAuthProvider(process.env.TWITCHCLIENTID, process.env.TWITCHCLIENTSECRET);
const twitchClient = new ApiClient({ authProvider });

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

            await msg.react('✅');

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

            await msg.react('✅');

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

let isStreamChecks: Map<string, number> = new Map();

setInterval(async () => {
    let streamers = await Kwako.db.collection('twitch').find().toArray();

    for(const data of streamers) {

        let user = await twitchClient.helix.users.getUserByName(data._id);

        if (!user) return Kwako.db.collection('twitch').deleteOne({ _id: data._id });

        let stream = await user.getStream();
        let isStream = data.isStream || false;

        if (stream && !isStream) {
            console.log(stream)
            isStreamChecks.set(data._id, 10);
            await Kwako.db.collection('twitch').updateOne({ _id: data._id }, { $set: { isStream: true } });

            let channels = data.channels || [];
            for(const channelID of channels) {
                let channel = await Kwako.channels.fetch(channelID, true);

                if(!channel) return Kwako.db.collection('twitch').updateOne({ _id: data._id }, { $pull: { channels: channelID } });
                if(channel.type !== 'text' && channel.type !== 'news') return;

                let thumbnail: string = stream.thumbnailUrl;
                thumbnail = thumbnail.replace('{width}', '1280');
                thumbnail = thumbnail.replace('{height}', '720');

                await (channel as TextChannel).send({'embed':{
                    "title": `🚨 ${stream.userDisplayName} is going live!`,
                    "description": stream.title,
                    "url": `https://twitch.tv/${stream.userDisplayName}`,
                    "color": 8926419,
                    "timestamp": new Date(),
                    "thumbnail": {
                        "url": thumbnail
                    }
                }})
            }
        } else if(!stream) {
            if(isStream && isStreamChecks.get(data._id) === 0) {
                isStreamChecks.delete(data._id);
                await Kwako.db.collection('twitch').updateOne({ _id: data._id }, { $set: { isStream: false } });
            } else {
                let value = isStreamChecks.get(data._id) || 1;
                value -= 1;
                isStreamChecks.set(data._id, value);
            }
        }
    }
}, 30000);