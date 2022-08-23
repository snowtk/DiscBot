import * as db from '../persistence/dbManager.js'
const defaultCoinName = 'coins'

export class discordGuild {
    constructor(id, name, coinEmote, guild = null) {
        this.id = id;
        this.name = name;
        this.coinEmote = coinEmote || defaultCoinName;
        this.guild = guild
    }


    setCoin(coinEmote) {
        this.coinEmote = coinEmote;
        db.updateGuildCoin(this, coinEmote);
    }
}