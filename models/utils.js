import { CacheHandler } from "../persistence/cache/cache-handler.js";
import { discordUser } from "./discordUser.js";
import * as logger from "./logger.js";
import * as chalkThemes from "./chalkThemes.js";
import { discordGuild } from "./discordGuild.js";

const cache = new CacheHandler().getInstance();


function log(message, ...params) {
    logger.log(chalkThemes.main("(utils) " + message), ...params);
}

export function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}


export async function getUser(userId, guildId, interaction) {
    let username = interaction.author ? interaction.author.username : interaction.user.username;
    let user = cache.getUserFromCache(userId, guildId)

    if (!user) {
        user = await discordUser.getUserFromDb(userId, guildId)

        if (!user) {
            user = await discordUser.registerUser(userId, username, guildId);
            log(`Registring ${user.name} to DB`);
        } else {
            log(`Getting ${user.name} from DB`);
        }

        cache.addUserToCache(userId, guildId, user)

    } else {
        log(`${user.name} already in cache`);
    }
    user.lastRequest = getUnixTime();
    user.setInteraction(interaction);
    cache.userCacheIsFull();

    return user;
}

export async function validadeGuilds(cachedGuilds, dbGuilds) {
    log(chalkThemes.setup(`Loading guilds`));
    let dbDict = Object.assign({}, ...dbGuilds.map((x) => ({ [x.id]: x })));

    for (var i = 0; i < cachedGuilds.length; i++) {
        if (dbDict[cachedGuilds[i].id]) {
            let dbGuild = dbDict[cachedGuilds[i].id];
            cache.addGuildToCache(cachedGuilds[i].id, new discordGuild(dbGuild.id, dbGuild.name, dbGuild.coinEmote, cachedGuilds[i]))
            //guilds[cachedGuilds[i].id] = new discordGuild(dbGuild.id, dbGuild.name, dbGuild.coinEmote, cachedGuilds[i]);
        } else {
            db.registerGuild(cachedGuilds[i]);
            cache.addGuildToCache(cachedGuilds[i].id, new discordGuild(cachedGuilds.id, cachedGuilds.name, null, cachedGuilds[i]))
            //     guilds[cachedGuilds[i].id] = new discordGuild(cachedGuilds[i].id, cachedGuilds[i].name, cachedGuilds[i]);
        }
    }
    log(chalkThemes.setup(`--------------------------------------------------`));
}