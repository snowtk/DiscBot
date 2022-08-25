import { RoleStore } from "../models/store.js";
import { RepositoryHandler } from "../persistence/repository.js";

const repo = new RepositoryHandler().getInstance();

export const setCoinAction = async (interaction) => {
    const newCoinName = interaction.options.getString("currency_name");
    const guild = await repo.getGuild(interaction.guild.id);
    guild.setCoin(newCoinName);
    await interaction.editReply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
}

export const addRoleToShop = async (interaction) => {
    const role = interaction.options.getRole("role");
    const isDynamic = interaction.options.getBoolean("dynamic_cost");
    const cost = interaction.options.getInteger("cost");
    const guild = await repo.getGuild(interaction.guild.id)
    const storeRole = await RoleStore.addRole(guild.id, role.id, isDynamic, cost);
    const replyMessage = storeRole ?
        `New role ${role.name} added to the store with cost ${storeRole.cost}  ${guild.coinEmote}!` :
        'Role was already in the store';
    await interaction.editReply(replyMessage);
}