import { Message } from "discord.js";

// Functions
import editPrefix from './editPrefix';
import editStarboard from "./editStarboard";
import editSuggestions from "./editSuggestions";
import editWelcomeMessage from "./editWelcomeMessage";
import editBoosterBenefit from "./editBoosterBenefit";
import editExpSystem from "./editExpSystem";
import editModLogs from "./editModLogs";
import editMuteRole from "./editMuteRole";
import editAutoMod from "./editAutoMod";
import editMsgLogs from "./editMsgLogs";

let emojis = ['❕', 'a:ExperienceOrb:735085209573261332', '🟣', '📖', '💬', '⚒', '⭐', '❓', '⛔', '✉️', '❌'];

export default async function chooseWhat(msg: Message, args: string[], guildConf: any, sent: Message): Promise<any> {
    let collected = await sent.awaitReactions((_reaction, user) => (emojis.includes(_reaction.emoji.name) || emojis.includes(_reaction.emoji.identifier)) && (user.id === msg.author.id), { max: 1, time: 60000 });
    if(!collected) return;

    let emote = collected.first().emoji.name;

    if(emote === '❕')
        return editPrefix(msg, args, guildConf, sent);
    if(emote === 'ExperienceOrb')
        return editExpSystem(msg, args, guildConf, sent, null);
    if(emote === '🟣')
        return editBoosterBenefit(msg, args, guildConf, sent);
    if(emote === '📖')
        return editModLogs(msg, args, guildConf, sent);
    if(emote === '💬')
        return editMsgLogs(msg, args, guildConf, sent);
    if(emote === '⚒')
        return editAutoMod(msg, args, guildConf, sent);
    if(emote === '❓')
        return editSuggestions(msg, args, guildConf, sent);
    if(emote === '⛔')
        return editMuteRole(msg, args, guildConf, sent);
    if(emote === '⭐')
        return editStarboard(msg, args, guildConf, sent);
    if(emote === '✉️')
        return editWelcomeMessage(msg, args, guildConf, sent);

    if(emote === '❌') {
        await msg.delete().catch(() => {return});
        return sent.delete();
    }
}