import * as db from '../persistence/dbManager.js'
import * as enums from './enums.js'

export function getUnixTime() {
    return Math.floor(Date.now() / 1000);
}
export class discordUser{
    constructor(userId, discordId, guildId, name, cash, interaction) {
        this.userId = userId;
        this.discordId = discordId;
        this.guildId = guildId;
        this.name = name;
        this.cash = cash;
        this.cooldowns = {};
        this.interaction = interaction;
      }
    
    setInteraction(interaction){
        this.interaction = interaction;
    }

    addCash(cash){
        db.addCash(this, cash);
        this.cash += cash;
    }

    beg(){
        let cash = Math.floor(0 + Math.random() * 3);
        this.addCash(cash);
        this.updateCooldown(enums.Actions.beg)
        return cash;
    }

    getActivityReward(){
        this.addCash(1);
        this.updateCooldown(enums.Actions.chatActivity)
        return;
    }

    updateCooldown(action){
        this.cooldowns[action.CooldownField] = getUnixTime()+action.cooldown;
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