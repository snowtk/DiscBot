import { EmbedBuilder } from "discord.js";
import { Actions, Color, CommandName } from "../models/enums.js"
import { RepositoryHandler } from "../persistence/repository.js"
import * as db from '../persistence/dbManager.js'
const repo =  new RepositoryHandler().getInstance();

const begAction = async (interaction) => {
    let user = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    if (!user.canAct(Actions.beg.fieldName)) {
        let secondsLeft = user.secondsUntilCanAct(enums.Actions.beg.fieldName);
        await user.interaction.editReply(`${Math.round(secondsLeft / 60)} minutes until you can beg again.`);
        return;
    }
    let cash = user.beg();
    let userAvatar = user.interaction.user.displayAvatarURL({ size: 32, dynamic: true });
    let guild = await repo.getGuild(user.guildId);
    let exampleEmbed = new EmbedBuilder()
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

    await user.interaction.editReply({ embeds: [exampleEmbed] });
}


const setCoinAction = async (interaction) => {
    let newCoinName = interaction.options.getString("currency_name");
    let guild = await repo.getGuild(interaction.guild.id);
    guild.setCoin(newCoinName);
    await interaction.editReply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
}

const topRichAction = async (interaction) => {
    let userList = await db.getRichestUsers(interaction);
    let guild = repo.getGuild(interaction.guild.id);
    let list = "";
    for (var i = 0; i < userList.length; i++) {
        list += `**#${i + 1} - ${userList[i].name}** - ${userList[i].cash} ${guild.coinEmote}\n`
    }
    let exampleEmbed = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`TOP ${userList.length} RICHEST`)
        .setDescription(list)
        .setTimestamp();

    await interaction.editReply({ embeds: [exampleEmbed] });
}

const giveCoins = async (interaction) => {
    let amount = interaction.options.getInteger('amount');
    let target = interaction.options.getUser('target');
    let giver = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    let interactionCopy = Object.assign({}, interaction);
    interactionCopy.user = target;
    let taker = await repo.getUser(target.id, interaction.guild.id, interactionCopy);
    let description = "";
    let guild = await repo.getGuild(interaction.guild.id);
    if (giver.cash >= amount) {
        giver.giveCash(taker, amount);
        description = `${giver.interaction.user.toString()} has given ${amount} ${guild.coinEmote} to ${taker.interaction.user.toString()}`
    } else {
        description = `You don't have enough ${guild.coinEmote}`
    }
    let exampleEmbed = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle('Charity')
        .setDescription(description)
        .setTimestamp();

    await interaction.editReply({ embeds: [exampleEmbed] });
}

export const actions = new Map([
    [CommandName.beg, begAction],
    [CommandName.giveCoin, giveCoins],
    [CommandName.setCoin, setCoinAction],
    [CommandName.topRich, topRichAction]
]
)
