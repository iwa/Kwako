import * as Discord from "discord.js";
const manager = new Discord.ShardingManager('build/bot.js', {
    shardArgs: ['--ansi', '--color'],
    totalShards: 2
});

manager.spawn(2, 1000);
manager.on('shardCreate', shard => { console.log(`shard: launched shard ${shard.id}`)});