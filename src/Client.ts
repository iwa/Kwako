import { Collection, Client }from "discord.js";

import log from './Logger';

import { MongoClient, Db } from 'mongodb';

// MongoDB constants
const url = process.env.MONGO_URL, dbName = process.env.MONGO_DBNAME;

import fs from 'fs';

export default new class Kwako extends Client {

    public log = log;

    public db: Db;

    public commands: Collection<any, any> = new Collection();

    public constructor() {
		super(
			{
				disableMentions: 'everyone',
			}
		);
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
	}

    public async start(token: string) {
		await this._init();
		return this.login(token);
	}
}