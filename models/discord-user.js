import { repo } from "../persistence/repository.js";
import { Actions } from './enums.js'
import * as logger from '../shared/logger.js'
import * as chalkThemes from '../shared/chalkThemes.js'
import { begging } from './skills/begging.js'
import { getUnixTime, HOUR_IN_SECONDS } from '../shared/utils.js'
import { giveCash } from './skills/give-cash.js'

export class DiscordUser {

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
        repo.addCashToUser(this, cash);
        this.cash += cash;
    }

    removeCash(cash) {
        if (cash <= 0) return;
        this.log(`Removing ${cash} coins from ${this.name}, ${this.cash} - ${cash} = ${this.cash - cash}`);
        repo.addCashToUser(this, 0 - cash);
        this.cash -= cash;
    }

    giveCash(taker, amount) {
        this.log(`${this.name} giving ${amount} coins to ${taker.name}`);
        return giveCash(this, taker, amount);
    }

    beg() {
        return begging(this);
    }

    getActivityReward() {
        console.log();
        let time = this.cooldowns[Actions.chatActivity.fieldName];
        if (time == null) {
            time = getUnixTime();
        }
        const extraTime = getUnixTime() - time; //time difference in seconds
        const extraHours = extraTime / HOUR_IN_SECONDS;
        const cashToAdd = this.#calculateCashToAdd(extraHours);
        this.addCash(Math.round(cashToAdd));
        this.updateCooldown(Actions.chatActivity)
        return;
    }

    //formula ajusted to the left so x(0) -> x(0+cooldown) to account for the cooldown time
    #calculateCashToAdd(extraHours) {
        const cooldownTime = Actions.chatActivity.cooldown / HOUR_IN_SECONDS;
        const extraHoursSum = extraHours + cooldownTime;
        this.log(`${this.name}: Activity reward for ${extraHoursSum}h of inactivity`)
        return (10 * extraHoursSum) / (1 + 0.08 * extraHoursSum);
    }

    updateCooldown(action) {
        this.cooldowns[action.fieldName] = getUnixTime() + action.cooldown;
        repo.updateUserCooldown(this, action.fieldName, getUnixTime() + action.cooldown);
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

    getUserProfileInformation(guildCoin = 'coins') {
        const userAttrs = new Map([
            ['Coins', `${this.cash} ${guildCoin}`]
        ]);

        const content = [];
        userAttrs.forEach((value, key) => {
            content.push(`${key} : ${value}`);
        });

        return content.join('\n');
    }

    static async getUser(userId, guildId, interaction) {
        return await repo.getUser(userId, guildId, interaction);
    }
}