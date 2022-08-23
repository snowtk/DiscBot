import { EmbedBuilder } from "discord.js";
import { Color, CommandName } from "../models/enums.js"
import { CacheHandler } from "../persistence/cache/cache-handler.js"
import * as db from '../persistence/dbManager.js'
const cache = new CacheHandler().getInstance();
const guilds = cache.guilds;
const users = cache.users;
const begAction = () => {

}


const setCoinAction = async (interaction, guilds) => {
    let newCoinName = interaction.options.getString("currency_name");
    guilds[interaction.guild.id].setCoin(newCoinName);

    await interaction.reply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
}

const topRichAction = async (interaction) => {
    await interaction.deferReply();
    db.getRichestUsers(interaction, topRichest);
}


async function topRichest(userList, interaction) {
    let list = "";
    for (var i = 0; i < userList.length; i++) {
        list += `**#${i + 1} - ${userList[i].name}** - ${userList[i].cash} ${guilds[interaction.guild.id].coinEmote}\n`
    }
    let exampleEmbed = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`TOP ${userList.length} RICHEST`)
        .setDescription(list)
        .setTimestamp();

    await interaction.editReply({ embeds: [exampleEmbed] });
}


export const actions = new Map([
    [CommandName.beg, begAction],
    [CommandName.giveCoin, begAction],
    [CommandName.setCoin, setCoinAction],
    [CommandName.topRich, topRichAction]
]
)
