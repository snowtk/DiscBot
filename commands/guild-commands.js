import { EmbedBuilder } from "discord.js";
import { Color } from "../models/enums.js";
import { addCashToGuildBank, generateAddCashToBankMessage } from "../models/skills/add-cash-to-guild-bank.js";
import * as db from '../persistence/dbManager.js';
import { RepositoryHandler } from "../persistence/repository.js";
const repo = new RepositoryHandler().getInstance();

export const addCashToGuild = async (interaction) => {
    const amount = interaction.options.getInteger('amount');
    const giver = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    const guild = await repo.getGuild(interaction.guild.id);

    let message = addCashToGuildBank(giver, guild, amount) ?
        `${giver.interaction.user.toString()} has given ${amount} ${guild.coinEmote} to ${guild.name}` :
        `You don't have enough ${guild.coinEmote}`;

    const reply = generateAddCashToBankMessage(message, guild)
    await interaction.editReply({ embeds: [reply] });
}

export const guildsTopRich = async (interaction) => {
    const activeGuild = await repo.getGuild(interaction.guild.id)
    const guildsList = await db.getRichestGuilds(interaction);
    const list = [];
    for (var i = 0; i < guildsList.length; i++) {
        const guild = guildsList[i]
        list.push(`**#${i + 1} - ${guild.name}** - ${guild.bank} ${activeGuild.coinEmote}`)
    }

    const reply = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`TOP ${guildsList.length} RICHEST GUILDS`)
        .setDescription(list.join('\n'))
        .setTimestamp();

    await interaction.editReply({ embeds: [reply] });
}

export const getGuildProfile = async (interaction) => {
    const guild = await repo.getGuild(interaction.guild.id)
    const description = guild.getGuildProfileInformation();
    const avatar = interaction.guild.iconURL({ size: 32, dynamic: true });

    const reply = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`${guild.name} Profile`)
        .setThumbnail(avatar)
        .setDescription(description)
        .setTimestamp();

    await interaction.editReply({ embeds: [reply] });
}