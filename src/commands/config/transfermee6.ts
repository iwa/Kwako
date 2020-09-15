import Kwako from '../../Client';
import { Message } from 'discord.js';
const Mee6LevelsApi = require("mee6-levels-api");

module.exports.run = async (msg: Message) => {
    if ((!msg.member.hasPermission('MANAGE_GUILD'))) return msg.delete();

    Mee6LevelsApi.getLeaderboardPage(msg.guild.id).then(async (leaderboard: any) => {
        console.log(leaderboard)
        if(!leaderboard) return msg.react('❌');
        if(!leaderboard[0]) return msg.react('❌');

        let guild = `exp.${msg.guild.id}`;

        await Kwako.db.collection('user').updateMany({}, { $unset: { [guild]: 0 }});

        for(const user of leaderboard)
            await Kwako.db.collection('user').updateOne({ _id: user.id }, { $set: { [guild]: Math.floor(user.xp.totalXp/10) } }, { upsert: true });

        await msg.react('✅')
    }).catch(() => { return msg.react('❌'); });

    Kwako.log.info({msg: 'transfer mee6', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name }})
};

module.exports.help = {
    name: 'transfermee6',
    usage: "transfermee6",
    desc: "Transfer Levels from MEE6\n\n:warning: This will erase all the current levels.",
    staff: true,
    perms: ['EMBED_LINKS', 'MANAGE_ROLES', 'MANAGE_MESSAGES']
};