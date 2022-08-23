import { Color } from "../enums.js";
import { EmbedBuilder } from "discord.js";

export function addCashToGuildBank(user, guild, amount) {
    if (user && amount > 0 && user.cash >= amount) {
        guild.addCashToGuildBank(user, amount);
        return true;
    }
    return false;
}

export function generateAddCashToBankMessage(description) {
    return new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle('Add Cash To Bank')
        .setDescription(description)
        .setTimestamp();

}