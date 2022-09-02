import * as db from './dbManager.js'
import * as logger from "../shared/logger.js";
import * as chalkThemes from "../shared/chalkThemes.js";
import { Cache } from './cache/cache-handler.js';
import { getUnixTime } from '../shared/utils.js';
import { DiscordGuild } from '../models/discord-guild.js';

function log(message, ...params) {
    logger.log(chalkThemes.error(message), ...params);
}

async function can(func) {
    return ((typeof func) == "function");
};

async function call(func, ...params) {
    if (can(func)) {
        return await func(...params)
    } else {
        log(`${func.name} not implemented in the database connection`)
    }
};
 let instance = null;

class Repository {

    constructor() {
        if (instance) {
            return instance;
        }
        instance = this;
        this.cache = new Cache();
        this.client = null;
    }


    log(message, ...params) {
        logger.log(chalkThemes.main(message), ...params);
    }

    //#region guilds
    async getGuild(guildId) {
        let guild = this.cache.getGuildFromCache(guildId);

        if (!guild) {
            guild = await call(db.getGuildFromDb, guildId);
            if (!guild) {
                let guildObj = client.guilds.cache.find(x => x.id = guildId);
                guild = await call(db.registerGuild, guildObj);
                this.log(`Registring Guild ${guildId} to DB`);
            } else {
                this.log(`Getting Guild ${guild.name} from DB`);
            }

            this.cache.addGuildToCache(guildId, guild)

        }
        return guild;
    }

    async getTopRichest(guildId) {
        return await call(db.getRichestUsers, guildId);
    }

    async getTopRichestGuilds() {
        return await call(db.getRichestGuilds);
    }

    async updateGuildBank(guild, amountToAdd) {
        return await call(db.updateGuildBank, guild, amountToAdd);
    }

    async updateGuildCoin(guild, coinEmote) {
        return await call(db.updateGuildCoin, guild, coinEmote);
    }

    //#endregion

    //#region Users
    async getUser(userId, guildId, interaction) {
        let username = interaction.author ? interaction.author.username : interaction.user.username;
        let user = this.cache.getUserFromCache(userId, guildId)

        if (!user) {
            user = await call(db.getUserFromDb, userId, guildId);
            if (!user) {
                user = await call(db.registerUser, userId, username, guildId);
                this.log(`Registring ${user.name} to DB`);
            }
            this.cache.addUserToCache(userId, guildId, user)

        } else {
            this.log(`${user.name} already in cache`);
        }
        user.lastRequest = getUnixTime();
        user.setInteraction(interaction);
        this.cache.userCacheIsFull();
        return user;
    }

    async addCashToUser(user, amount) {
        call(db.addCashToUser, user, amount);
    }

    async updateUserCooldown(user, fieldName, unixCooldown) {
        call(db.updateUserCooldown, user, fieldName, unixCooldown);
    }

    //#endregion

    async validateGuilds() {
        log(chalkThemes.setup(`Loading guilds`));
        let cachedGuilds = this.client.guilds.cache.map(guild => guild);
        let dbGuilds = await call(db.getGuilds);
        let dbDict = Object.assign({}, ...dbGuilds.map((x) => ({ [x.id]: x })));

        for (var i = 0; i < cachedGuilds.length; i++) {
            if (dbDict[cachedGuilds[i].id]) {
                let dbGuild = dbDict[cachedGuilds[i].id];
                this.cache.addGuildToCache(cachedGuilds[i].id, new DiscordGuild(dbGuild.id, dbGuild.name, dbGuild.coinEmote, cachedGuilds[i], dbGuild.bank))
                //guilds[cachedGuilds[i].id] = new DiscordGuild(dbGuild.id, dbGuild.name, dbGuild.coinEmote, cachedGuilds[i]);
            } else {
                let newGuild = await call(db.registerGuild, cachedGuilds[i]);
                this.cache.addGuildToCache(cachedGuilds[i].id, newGuild)
                //guilds[cachedGuilds[i].id] = new DiscordGuild(cachedGuilds[i].id, cachedGuilds[i].name, cachedGuilds[i]);
            }
        }
        log(chalkThemes.setup(`--------------------------------------------------`));
    }

}

export var repo = new Repository();