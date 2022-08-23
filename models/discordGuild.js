import * as db from '../persistence/dbManager.js'
const defaultCoinName = 'coins'

export class discordGuild {
    constructor(id, name, coinEmote = 'coins', guild = null, bank = 0) {
        this.id = id;
        this.name = name;
        this.coinEmote = coinEmote || defaultCoinName;
        this.guild = guild;
        this.bank = bank;
    }

    addCashToGuildBank(user, amount) {
        if (user && amount > 0) {
            user.removeCash(amount);
            db.updateGuildBank(this, amount);
            this.bank += amount;
            return true;
        }
        return false;
    }

    setCoin(coinEmote) {
        this.coinEmote = coinEmote;
        db.updateGuildCoin(this, coinEmote);
    }
}