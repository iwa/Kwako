/**
 * 'Loop' function that checks for a Highfive request
 * @packageDocumentation
 * @module HighfiveWatcher
 * @category Events
 */
import Kwako from '../Client'
import { MessageReaction, User, MessageEmbed } from 'discord.js';

export default async function highfiveWatcher(reaction: MessageReaction, author: User) {
    if (reaction.emoji.name === '✋') {
        let result = await Kwako.db.collection('highfive').findOne({ '_id': { $eq: reaction.message.id }, 'target': { $eq: author.id } });

        if (result) {
            await reaction.message.delete()

            const embed = new MessageEmbed();
            embed.setColor('#F2DEB0')
            embed.setDescription(`**<@${result.author}> 🙌 <@${author.id}>**`)
            embed.setImage(`https://${process.env.CDN_URL}/img/highfive/${result.gif}.gif`)
            await Kwako.db.collection('highfive').deleteOne({ 'target': { $eq: author.id } })

            await Kwako.db.collection('user').updateOne({ '_id': { $eq: result.author } }, { $inc: { highfive: 1 } });
            await Kwako.db.collection('user').updateOne({ '_id': { $eq: author.id } }, { $inc: { highfive: 1 } });
            return reaction.message.channel.send(embed)
                .then(() => {
                    Kwako.log.info(`info: highfive`);
                })
                .catch(Kwako.log.error);
        }
    }
}