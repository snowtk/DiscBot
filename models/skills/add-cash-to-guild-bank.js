import { EmbedBuilder } from "discord.js";
import { Color } from "../enums.js";

export function addCashToGuildBank(user, guild, amount) {
    if (user && amount > 0 && user.cash >= amount) {
        guild.addCashToGuildBank(user, amount);
        return true;
    }
    return false;
}

export function generateAddCashToBankMessage(message, guild) {
    return new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle('Add Cash To Bank')
        .setDescription(message)
        .addFields({ name: `${guild.name} Total Cash in Bank`, value: `${guild.bank} ${guild.coinEmote}`, inline: true })
        .setTimestamp();

}