import { EmbedBuilder } from "discord.js";
import { Actions, Color, CommandName } from "../models/enums.js"
import { RepositoryHandler } from "../persistence/repository.js"
import * as db from '../persistence/dbManager.js'
import { generateBegginMessage } from "../models/skills/begging.js";
import { generateGiveCashMessage } from "../models/skills/give-cash.js";
const repo = new RepositoryHandler().getInstance();


const begAction = async (interaction) => {
    const user = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    const fieldName = Actions.beg.fieldName

    if (!user.canAct(fieldName)) {
        const secondsLeft = user.secondsUntilCanAct(fieldName);
        await user.interaction.editReply(`${Math.round(secondsLeft / 60)} minutes until you can beg again.`);
        return;
    }
    const cash = user.beg();
    const guild = await repo.getGuild(user.guildId);
    const exampleEmbed = generateBegginMessage(user, guild, cash);

    await user.interaction.editReply({ embeds: [exampleEmbed] });
}


const setCoinAction = async (interaction) => {
    const newCoinName = interaction.options.getString("currency_name");
    const guild = await repo.getGuild(interaction.guild.id);
    guild.setCoin(newCoinName);
    await interaction.editReply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
}

const topRichAction = async (interaction) => {
    const userList = await db.getRichestUsers(interaction);
    const guild = await repo.getGuild(interaction.guild.id);
    const list = [];
    for (var i = 0; i < userList.length; i++) {
        list.push(`**#${i + 1} - ${userList[i].name}** - ${userList[i].cash} ${guild.coinEmote}`)
    }

    const exampleEmbed = new EmbedBuilder()
        .setColor(Color.purple)
        .setTitle(`TOP ${userList.length} RICHEST`)
        .setDescription(list.join('\n'))
        .setTimestamp();

    await interaction.editReply({ embeds: [exampleEmbed] });
}

const giveCoins = async (interaction) => {
    const amount = interaction.options.getInteger('amount');
    const target = interaction.options.getUser('target');
    const giver = await repo.getUser(interaction.user.id, interaction.guild.id, interaction);
    let interactionCopy = Object.assign({}, interaction);
    interactionCopy.user = target;
    const taker = await repo.getUser(target.id, interaction.guild.id, interactionCopy);
    const guild = await repo.getGuild(interaction.guild.id);

    let description = giver.giveCash(taker, amount) ?
        `${giver.interaction.user.toString()} has given ${amount} ${guild.coinEmote} to ${taker.interaction.user.toString()}` :
        `You don't have enough ${guild.coinEmote}`;

    const exampleEmbed = generateGiveCashMessage(description)

    await interaction.editReply({ embeds: [exampleEmbed] });
}

export const actions = new Map([
    [CommandName.beg, begAction],
    [CommandName.giveCoin, giveCoins],
    [CommandName.setCoin, setCoinAction],
    [CommandName.topRich, topRichAction]
]
)
