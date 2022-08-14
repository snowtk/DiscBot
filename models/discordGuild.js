import * as db from '../persistence/dbManager.js'
import * as enums from './enums.js'

export class discordGuild{
    constructor(id, name, coinEmote = "coins") {
        this.id = id;
        this.name = name;
        this.coinEmote = coinEmote;
      }
    
    setCoin(coinEmote){
        this.coinEmote = coinEmote;
        db.updateGuildCoin(this, coinEmote);
    }
}