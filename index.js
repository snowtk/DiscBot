import dotenv from 'dotenv'
dotenv.config();
import { CommandName } from './models/enums.js';
import { SlashCommandBuilder, REST, Routes, PermissionFlagsBits } from 'discord.js';

const CLIENT_ID = process.env.client_id
const token = process.env.token
const commands = [
  {
    name: CommandName.beg,
    description: 'beg ecila for pennies'
  },
];
const setCoin = new SlashCommandBuilder()
  .setName(CommandName.setCoin)
  .setDescription('Set currency name/emote for this server')
  .addStringOption(option => option.setName('currency_name').setDescription('currency name or emote').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
const topRich = new SlashCommandBuilder()
  .setName(CommandName.topRich)
  .setDescription('List of the richest members of the server');
const giveCoins = new SlashCommandBuilder()
  .setName(CommandName.giveCoin)
  .setDescription('give someone coins')
  .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true))
  .addIntegerOption(option => option.setName('amount').setDescription('amount of coins to give').setRequired(true).setMinValue(0));
const addCashToGuild = new SlashCommandBuilder()
  .setName(CommandName.addCashToGuild)
  .setDescription('add coins to the guild bank')
  .addIntegerOption(option => option.setName('amount').setDescription('amount of coins to give').setRequired(true).setMinValue(0));
const topRichGuilds = new SlashCommandBuilder()
  .setName(CommandName.guildTopRich)
  .setDescription('List of the richest servers');
const getUserProfile = new SlashCommandBuilder()
  .setName(CommandName.getUserProfile)
  .setDescription('check a user profile')
  .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(false));
const getGuildProfile = new SlashCommandBuilder()
  .setName(CommandName.getGuildProfile)
  .setDescription('check the guild profile');
const addRoleToShop = new SlashCommandBuilder()
  .setName(CommandName.addRoleToShop)
  .setDescription('add a role to the shop')
  .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true))
  .addBooleanOption(option => option.setName('dynamic_cost').setDescription('Sets that the cost of the role is dynamic (based on your server current bank value) or fixed').setRequired(true))
  .addIntegerOption(option => option.setName('cost').setDescription('calculate the % of cost (if value is set to be dynamic) of the role or set if to a static value').setRequired(true).setMinValue(0))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
;
commands.push(setCoin);
commands.push(topRich);
commands.push(giveCoins);
commands.push(addCashToGuild);
commands.push(topRichGuilds);
commands.push(getUserProfile);
commands.push(getGuildProfile);
commands.push(addRoleToShop);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    //await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();