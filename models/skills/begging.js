import { Actions, Color } from "../enums.js";
import { EmbedBuilder } from "discord.js";

export function begging(user) {
    const cash = Math.floor(0 + Math.random() * 3);
    user.addCash(cash);
    user.updateCooldown(Actions.beg)
    return cash;
}

export function generateBegginMessage(user, guild, cash) {
    const userAvatar = user.interaction.user.displayAvatarURL({ size: 32, dynamic: true });
    return new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle("Begging")
        //.setAuthor({ name: user.name, iconURL: userAvatar })
        .setDescription(`${user.name} begged for pennies and received **${cash}** ${guild.coinEmote}.`)
        //.setImage('https://cdn3.iconfinder.com/data/icons/human-trafficking/236/human-traffiking-trade-003-512.png')
        .setThumbnail('https://cdn3.iconfinder.com/data/icons/human-trafficking/236/human-traffiking-trade-003-512.png')
        .addFields({ name: `${user.name} Total Cash`, value: `${user.cash} ${guild.coinEmote}`, inline: true })
        .setTimestamp()
        .setFooter({ text: `${user.name}`, iconURL: `${userAvatar}` });
    //interaction.user.toString() + " won " + cash + " EcilaCoins\nNew balance:" + (user.cash+cash)

}