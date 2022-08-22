import * as logger from "../../models/logger.js";
import * as chalkThemes from "../../models/chalkThemes.js";

class Cache {

    constructor() {
        this.users = {};
        this.guilds = {};
        this._maximunSize = 100;
    }


    log(message, ...params) {
        logger.log(chalkThemes.main(message), ...params);
    }

    getUserFromCache(userId, guildId) {
        return this.users[`${userId}${guildId}`]
    }

    addUserToCache(userId, guildId, user) {
        this.log(`Adding ${user.name} to cache`);
        this.users[`${userId}${guildId}`] = user;
    }

    //TODO implemment in guilds
    #cacheIsFull(cache) {
        if (Object.keys(cache).length > this._maximunSize) {
            this.log('Clearing cache');
            var keys = Object.keys(cache);
            var lowestLastRequest = Math.min.apply(null, keys.map(key => cache[key].lastRequest));
            var match = keys.find(key => cache[key].lastRequest === lowestLastRequest);
            delete cache[match];
        }
    }

    //TODO implemment in guilds
    userCacheIsFull() {
        this.#cacheIsFull(this.users)
    }
}


export class CacheHandler {

    constructor() {
        if (!CacheHandler.instance) {
            CacheHandler.instance = new Cache();
        }
    }

    getInstance() {
        return CacheHandler.instance;
    }

}
