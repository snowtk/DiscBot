import * as db from '../persistence/dbManager.js'
import * as enums from './enums.js'
import * as logger from './logger.js'
import * as chalkThemes from '../models/chalkThemes.js'
import { begging } from './skills/begging.js'
import { getUnixTime } from './utils.js'

export class discordUser {

    constructor(userId, discordId, guildId, name, cash, interaction) {
        this.userId = userId;
        this.discordId = discordId;
        this.guildId = guildId;
        this.name = name;
        this.cash = cash;
        this.cooldowns = {};
        this.interaction = interaction;
    }

    log(message, ...params) {
        logger.log(chalkThemes.internal(this, message), ...params);
    }

    setInteraction(interaction) {
        this.interaction = interaction;
    }

    addCash(cash) {
        if (cash <= 0) return;
        this.log(`Adding ${cash} coins to ${this.name}, ${this.cash} + ${cash} = ${this.cash + cash}`);
        db.addCash(this, cash);
        this.cash += cash;
    }
    removeCash(cash) {
        if (cash <= 0) return;
        this.log(`Removing ${cash} coins from ${this.name}, ${this.cash} - ${cash} = ${this.cash - cash}`);
        db.addCash(this, 0 - cash);
        this.cash -= cash;
    }

    giveCash(taker, amount) {
        // TODO: make this function in other file 

        if (amount > this.cash) return;
        this.log(`${this.name} giving ${amount} coins to ${taker.name}`)
        this.removeCash(amount);
        taker.addCash(amount);
    }

    beg() {
        return begging(this);
    }

    getActivityReward() {
        // TODO: make this function in other file 
        this.addCash(1);
        this.updateCooldown(enums.Actions.chatActivity)
        return;
    }

    updateCooldown(action) {
        this.cooldowns[action.fieldName] = getUnixTime() + action.cooldown;
        db.updateCooldown(this, action.fieldName, getUnixTime() + action.cooldown);
    }

    canAct(field) {
        if (this.cooldowns[field]) {
            let currentTime = getUnixTime();

            return currentTime > parseInt(this.cooldowns[field]);
        }
        return true;
    }

    secondsUntilCanAct(field) {
        if (this.cooldowns[field]) {
            let currentTime = getUnixTime();

            return parseInt(this.cooldowns[field]) - currentTime;
        }
        return 0;
    }

    static async getUserFromDb(userId, guildId) {
        return await db.getUser(userId, guildId)
    }

    static async registerUser(userId, username, guildId) {
        return await db.registerUser(userId, username, guildId);
    }
}