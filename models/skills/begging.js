import * as enums from '../enums.js'

export function begging(user){
    let cash = Math.floor(0 + Math.random() * 3);
    user.addCash(cash);
    user.updateCooldown(enums.Actions.beg)
    return cash;
}