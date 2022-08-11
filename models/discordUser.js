import * as db from '../persistence/dbManager.js'
import * as enums from './enums.js'

function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}
export class discordUser{
    constructor(id, name, cash, interaction) {
        this.id = id;
        this.name = name;
        this.cash = cash;
        this.cooldowns = {};
        this.interaction = interaction;
      }

    addCash(cash){
        db.addCash(this, cash);
        this.cash += cash;
    }

    beg(){
        let cash = Math.floor(0 + Math.random() * 5);
        this.addCash(cash);
        this.updateCooldown(enums.Actions.beg)
        return cash;
    }

    updateCooldown(action){
        db.updateCooldown(this, action.CooldownField, getUnixTime()+action.cooldown);
    }

    canAct(field){
        if(this.cooldowns[field]){
            let currentTime = getUnixTime();
            if(currentTime > parseInt(this.cooldowns[field])){
                return true;
            }else{
                return false;
            }
        }
        return true;
    }

    SecondsUntilCanAct(field){
        if(this.cooldowns[field]){
            let currentTime = getUnixTime();
            return parseInt(this.cooldowns[field]) - currentTime;
        }
        return 0;
    }
}