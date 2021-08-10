import Bot from '../../Client'
import { CommandInteraction, Message } from 'discord.js';
import Command from '../../structures/Command';

export default new class PongCommand extends Command {

    public constructor() {
        super('pong',
            'Get response time between Kwako and Discord servers.',
            SendPongMsg,
            SendPongInt,
            0,
            [],
            ['EMBED_LINKS'],
            'pong');
    }

}

async function SendPongMsg(msg: Message) {
    let ping = Math.ceil(Bot.ws.ping);
    await msg.channel.send(Bot.createEmbed(null, `:ping_pong: Ping ! \`${ping}ms\``))
        .then(() => { Bot.log.info({ msg: 'ping', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } }); })
        .catch(err => Bot.log.error(err));
}

async function SendPongInt(int: CommandInteraction) {
    let ping = Math.ceil(Bot.ws.ping);
    await int.reply(Bot.createEmbed(null, `:ping_pong: Ping ! \`${ping}ms\``))
        .then(() => { Bot.log.info({ msg: 'ping', author: { id: int.user.id, name: int.user.tag }, guild: { id: int.guildId, name: int.guild.name } }); })
        .catch(err => Bot.log.error(err));
}