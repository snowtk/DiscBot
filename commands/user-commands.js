import { EmbedBuilder } from "discord.js";
import { Actions, Color } from "../models/enums.js";
import { generateBegginMessage } from "../models/skills/begging.js";
import { generateGiveCashMessage } from "../models/skills/give-cash.js";
import * as db from '../persistence/dbManager.js';
import { RepositoryHandler } from "../persistence/repository.js";
import { addCashToGuild } from "./guild-commands.js";
const repo = new RepositoryHandler().getInstance();

export const begAction = async (interaction) => {
    const user = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    const fieldName = Actions.beg.fieldName

    if (!user.canAct(fieldName)) {
        const secondsLeft = user.secondsUntilCanAct(fieldName);
        await user.interaction.editReply(`${Math.round(secondsLeft / 60)} minutes until you can beg again.`);
        return;
    }
    const cash = user.beg();
    const guild = await repo.getGuild(user.guildId);
    const reply = generateBegginMessage(user, guild, cash);

    await user.interaction.editReply({ embeds: [reply] });
}

export const setCoinAction = async (interaction) => {
    const newCoinName = interaction.options.getString("currency_name");
    const guild = await repo.getGuild(interaction.guild.id);
    guild.setCoin(newCoinName);
    await interaction.editReply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
}

export const topRichAction = async (interaction) => {
    const userList = await db.getRichestUsers(interaction);
    const guild = await repo.getGuild(interaction.guild.id);
    const list = [];
    for (var i = 0; i < userList.length; i++) {
        list.push(`**#${i + 1} - ${userList[i].name}** - ${userList[i].cash} ${guild.coinEmote}`)
    }

    const reply = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`TOP ${userList.length} RICHEST USERS`)
        .setDescription("\n" + list.join('\n'))
        .setTimestamp();

    await interaction.editReply({ embeds: [reply] });
}

export const giveCoins = async (interaction) => {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');

    if (target.bot) {
        await addCashToGuild(interaction);
        return;
    }

    const giver = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    let interactionCopy = Object.assign({}, interaction);
    interactionCopy.user = target;
    const taker = await repo.getUser(target.id, interaction.guild.id, interactionCopy);
    const guild = await repo.getGuild(interaction.guild.id);

    let description = giver.giveCash(taker, amount) ?
        `${giver.interaction.user.toString()} has given ${amount} ${guild.coinEmote} to ${taker.interaction.user.toString()}` :
        `You don't have enough ${guild.coinEmote}`;

    const reply = generateGiveCashMessage(description)

    await interaction.editReply({ embeds: [reply] });
}

export const getUserProfile = async (interaction) => {
    const userToFind = interaction.options.getUser('user');
    const userId = userToFind ? userToFind.id : interaction.user.id;
    const user = await repo.getUser(userId, interaction.guild.id, interaction);
    const guild = await repo.getGuild(interaction.guild.id)
    const description = user.getUserProfileInformation(guild.coinEmote)
    const userAvatar = userToFind ?
        userToFind.displayAvatarURL({ size: 32, dynamic: true }) :
        user.interaction.user.displayAvatarURL({ size: 32, dynamic: true });

    const reply = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`${user.name} Profile`)
        .setThumbnail(userAvatar)
        .setDescription(description)
        .setTimestamp();

    await interaction.editReply({ embeds: [reply] });
}