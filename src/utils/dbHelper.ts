import Bot from '../Client';

export default new class dbHelper {
    public start() {
        this.createCollections();
    }

    public createCollections() {
        this.twitchCollection();
        this.rrCollection();
    }

    /*
     * Twitch Collection
     */
    public async twitchCollection() {
        await Bot.db.createCollection('twitch', {
            validator: {
                $jsonSchema: {
                    required: [
                        '_id',
                        'streamer',
                        'channel',
                        'isStreaming'
                    ],
                    properties: {
                        streamer: {
                            bsonType: 'string'
                        },
                        channel: {
                            bsonType: 'string'
                        },
                        isStreaming: {
                            bsonType: 'bool'
                        }
                    }
                }
            },
            validationLevel: 'strict',
            validationAction: 'error'
        }).catch(err => {
            if (err) {
                if (err.codeName === "NamespaceExists") return;
                else Bot.log.error(err);
            }
        });
    }

    public async twitchInsertOne(streamer: string, channel: string) {
        await Bot.db.collection('twitch').insertOne({
            streamer: streamer,
            channel: channel,
            isStreaming: false
        }).catch(err => Bot.log.error(err));
    }

    /*
     * Reaction Role Collection
     */

    public async rrCollection() {
        await Bot.db.createCollection('rr', {
            validator: {
                $jsonSchema: {
                    required: [
                        '_id',
                        'msg',
                        'channel',
                        'roles'
                    ],
                    properties: {
                        msg: {
                            bsonType: 'string'
                        },
                        channel: {
                            bsonType: 'string'
                        },
                        roles: {
                            bsonType: 'array'
                        },
                        "roles.id": {
                            bsonType: 'string'
                        },
                        "roles.emote": {
                            bsonType: 'string'
                        }
                    }
                }
            },
            validationLevel: 'strict',
            validationAction: 'error'
        }).then(async col => {
            await col.createIndex('msg', { unique: true });
        }).catch(err => {
            if (err) {
                if (err.codeName === "NamespaceExists") return;
                else Bot.log.error(err);
            }
        });
    }

    public async rrInsertOne(msg: string, channel: string) {
        await Bot.db.collection('rr').insertOne({
            msg: msg,
            channel: channel,
            roles: []
        }).catch(err => Bot.log.error(err));
    }
}