import { Color } from "../enums.js";
import { EmbedBuilder } from "discord.js";

export function giveCash(user, taker, amount) {
    if (amount <= user.cash) {
        user.removeCash(amount);
        taker.addCash(amount);
        return true;
    }

    return false;
}

export function generateGiveCashMessage(description) {
    return new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle('Charity')
        .setDescription(description)
        .setTimestamp();

}