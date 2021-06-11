import { Collection, Client } from "discord.js";
import log from './Logger';
import pg from 'pg';
import axios from 'axios';
//import { Manager } from 'erela.js';

import fs from 'fs';

//import GuildConfig from './interfaces/GuildConfig';

export default new class Kwako extends Client {

    public prefix = process.env.PREFIX;

    public log = log;

    public db: pg.Client = new pg.Client({
        host: 'localhost',
        database: 'kwako',
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD
    });

    public commands: Collection<any, any> = new Collection();

    public patrons: Set<string> = new Set();
    private golden: Set<string> = new Set();

    //public music: Manager;

    /*private defaultConfig: GuildConfig = {
        prefix: "!",
        welcomeMessage: "",
        starboardChannel: "",
        muteRole: "",
        msgLogChannel: "",
        suggestionChannel: "",
        disabledCommands: [] as string[],
        useExpSystem: true,
        showLevelUp: true,
        boosterBenefits: true,
        customEmote: "",
        starReactions: 5,
        modLogChannel: "",
        automodCensoredWords: false,
        automodCensoredWordsList: [],
        automodRepeatedText: false,
        automodLinks: false,
        automodCaps: false,
        automodExcessiveEmojis: false,
        automodExcessiveSpoilers: false,
        automodExcessiveMentions: false,
    }*/

    public constructor() {
        super(
            {
                disableMentions: 'everyone',
            }
        );
    }

    private async getPledgeData() {
        const link = `https://www.patreon.com/api/oauth2/api/campaigns/3028203/pledges`;
        return axios
            .get(link, {
                headers: { authorization: `Bearer ${process.env.PATREON_TOKEN}` }
            })
            .then(async res => {
                let golden: Set<string> = new Set();
                let goldenId: Set<string> = new Set();
                for (const thing of res.data.data)
                    if (thing.attributes.amount_cents >= 1000)
                        goldenId.add(thing.relationships.patron.data.id)

                let users: Set<string> = new Set();
                for (const thing of res.data.included)
                    if (thing.type === 'user')
                        if (thing.attributes.social_connections.discord) {
                            users.add(thing.attributes.social_connections.discord.user_id)
                            if (goldenId.has(thing.id))
                                golden.add(thing.attributes.full_name)
                        }

                this.patrons = users;
                this.golden = golden;
            })
            .catch(err => {
                return this.log.error({ msg: `Error Fetching Patreon Data`, status: err.response.status, reason: err.response.statusText })
            });
    }

    public getGolden() {
        let string = "";
        for (const user of this.golden)
            string = `${string}${user}, `

        string = string.slice(0, (string.length - 2));

        return string;
    }

    /*public async getGuildConf(id: string): Promise<GuildConfig> {
        let guild = await this.db.collection('guilds').findOne({ '_id': { $eq: id } });
        let guildConf = (guild) ? guild.config : this.defaultConfig;

        let config: GuildConfig = {
            prefix: guildConf.prefix || this.defaultConfig.prefix,
            welcomeMessage: guildConf.welcomeMessage || this.defaultConfig.welcomeMessage,
            starboardChannel: guildConf.starboardChannel || this.defaultConfig.starboardChannel,
            muteRole: guildConf.muteRole || this.defaultConfig.muteRole,
            msgLogChannel: guildConf.msgLogChannel || this.defaultConfig.msgLogChannel,
            suggestionChannel: guildConf.suggestionChannel || this.defaultConfig.suggestionChannel,
            disabledCommands: (guildConf.disabledCommands || this.defaultConfig.disabledCommands) as string[],
            useExpSystem: (!guildConf.useExpSystem) ? guildConf.useExpSystem : this.defaultConfig.useExpSystem,
            showLevelUp: (!guildConf.showLevelUp) ? guildConf.showLevelUp : this.defaultConfig.showLevelUp,
            boosterBenefits: (!guildConf.boosterBenefits) ? guildConf.boosterBenefits : this.defaultConfig.boosterBenefits,
            customEmote: guildConf.customEmote || this.defaultConfig.customEmote,
            starReactions: guildConf.starReactions || this.defaultConfig.starReactions,
            modLogChannel: guildConf.modLogChannel || this.defaultConfig.modLogChannel,
            automodCensoredWords: guildConf.automodCensoredWords || this.defaultConfig.automodCensoredWords,
            automodCensoredWordsList: guildConf.automodCensoredWordsList || this.defaultConfig.automodCensoredWordsList,
            automodRepeatedText: guildConf.automodRepeatedText || this.defaultConfig.automodRepeatedText,
            automodLinks: guildConf.automodLinks || this.defaultConfig.automodLinks,
            automodCaps: guildConf.automodCaps || this.defaultConfig.automodCaps,
            automodExcessiveEmojis: guildConf.automodExcessiveEmojis || this.defaultConfig.automodExcessiveEmojis,
            automodExcessiveSpoilers: guildConf.automodExcessiveSpoilers || this.defaultConfig.automodExcessiveSpoilers,
            automodExcessiveMentions: guildConf.automodExcessiveMentions || this.defaultConfig.automodExcessiveMentions,
        }

        return config;
    }*/

    //public getDefaultConf(): GuildConfig {
    //    return this.defaultConfig;
    //}

    private async _init() {
        /*fs.readdir('./build/commands/', { withFileTypes: true }, (error, f) => {
            if (error) return log.error(error);
            f.forEach((f) => {
                if (f.isDirectory()) {
                    fs.readdir(`./build/commands/${f.name}/`, (error, fi) => {
                        if (error) return log.error(error);
                        fi.forEach((fi) => {
                            if (!fi.endsWith(".js")) return;
                            let commande = require(`./commands/${f.name}/${fi}`);
                            this.commands.set(commande.help.name, commande);
                        })
                    })
                } else {
                    if (!f.name.endsWith(".js")) return;
                    let commande = require(`./commands/${f.name}`);
                    this.commands.set(commande.help.name, commande);
                }
            });
        });
        this.log.trace('commmands initialized');*/

        this.db.connect();
        this.log.trace('db initialized');

        await this.getPledgeData();
        this.log.trace('premium enabled');

        this.setInterval(async () => {
            await this.getPledgeData();
        }, 300000);
    }

    public async start(token: string) {
        await this._init();
        await this.login(token);
    }
}