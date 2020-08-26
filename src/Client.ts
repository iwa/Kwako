import { Collection, Client }from "discord.js";

import log from './Logger';

import { MongoClient, Db } from 'mongodb';

import axios from 'axios';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

import fs from 'fs';

export default new class Kwako extends Client {

    public log = log;

    public db: Db;

    public commands: Collection<any, any> = new Collection();

    public patrons: Set<string> = new Set();
    private golden: Set<string> = new Set();

    public constructor() {
		super(
			{
				disableMentions: 'everyone',
			}
		);
    }

    private async getPledgeData() {
        const link = `https://www.patreon.com/api/oauth2/api/campaigns/3028203/pledges`;
        return await axios
            .get(link, {
                headers: { authorization: `Bearer ${process.env.PATREON_TOKEN}` }
            })
            .then(async res => {
                let golden: Set<string> = new Set();
                let goldenId: Set<string> = new Set();
                for(const thing of res.data.data)
                    if(thing.attributes.amount_cents >= 1000)
                        goldenId.add(thing.relationships.patron.data.id)

                let users: Set<string> = new Set();
                for(const thing of res.data.included)
                    if(thing.type === 'user')
                        if(thing.attributes.social_connections.discord) {
                            users.add(thing.attributes.social_connections.discord.user_id)
                            if(goldenId.has(thing.id))
                                golden.add(thing.attributes.full_name)
                        }

                this.patrons = users;
                this.golden = golden;
            })
            .catch(err => {
                return this.log.error({msg: `Error Fetching Patreon Data:`, status: err.response.status, reason: err.response.statusText})
            });
    }

    public getGolden() {
        let string = "";
        for(const user of this.golden)
            string = `${string}${user}, `

        string = string.slice(0, (string.length-2));

        return string;
    }

    private async _init() {
		fs.readdir('./build/commands/', { withFileTypes: true }, (error, f) => {
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
        this.log.debug('commmands initialized')

        let mongod = await MongoClient.connect(url, { 'useUnifiedTopology': true });
        this.db = mongod.db(dbName);
        this.log.debug('db initialized')

        await this.getPledgeData();
        this.log.debug({msg: 'premium enabled'})

        this.setInterval(async () => {
            await this.getPledgeData();
        }, 300000);
	}

    public async start(token: string) {
		await this._init();
		return this.login(token);
	}
}