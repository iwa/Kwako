import Bot from '../../Client'
import { CommandInteraction, Interaction, Message } from 'discord.js';
import Command from '../../structures/Command';

export default new class PingCommand extends Command {

    public constructor() {
        super('ping',
            'Get response time between Kwako and Discord servers.',
            SendPingMsg,
            SendPingInt,
            0,
            [],
            ['EMBED_LINKS'],
            'ping');
    }

}

async function SendPingMsg(msg: Message) {
    let ping = Math.ceil(Bot.ws.ping);
    await msg.channel.send(Bot.createEmbed(null, `:ping_pong: Pong ! \`${ping}ms\``))
        .then(() => { Bot.log.info({ msg: 'ping', author: { id: msg.author.id, name: msg.author.tag }, guild: { id: msg.guild.id, name: msg.guild.name } }); })
        .catch(err => Bot.log.error(err));
}

async function SendPingInt(int: CommandInteraction) {
    let ping = Math.ceil(Bot.ws.ping);
    await int.reply(Bot.createEmbed(null, `:ping_pong: Pong ! \`${ping}ms\``))
        .then(() => { Bot.log.info({ msg: 'ping', author: { id: int.user.id, name: int.user.tag }, guild: { id: int.guildId, name: int.guild.name } }); })
        .catch(err => Bot.log.error(err));
}