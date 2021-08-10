import Kwako from '../Client';
import { TextChannel } from 'discord.js';

export default async function ready() {
    Kwako.user.setPresence({ status: 'online', activities: [{ name: "k!help ☁️", type: 'WATCHING' }], afk: false });

    //let allMsg = Kwako.db.collection('msg').find()
    //if(allMsg) {
    //    allMsg.forEach(async elem => {
    //        let channel = await Kwako.channels.fetch(elem.channel).catch(() => {return});
    //        if(channel && channel.type === 'text') {
    //            let msg = await (channel as TextChannel).messages.fetch(elem._id, true).catch(() => {return});
    //            if(!msg)
    //                await Kwako.db.collection('msg').deleteOne({ _id: elem._id });
    //        } else
    //            await Kwako.db.collection('msg').deleteOne({ _id: elem._id });
    //    });
    //}
}