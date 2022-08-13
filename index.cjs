require('dotenv').config()
const { SlashCommandBuilder, REST, Routes, PermissionFlagsBits} = require('discord.js');
const CLIENT_ID = process.env['client_id']
const token = process.env['token']
const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },{
    name: 'beg',
    description:'beg ecila for pennies'
  },
];
const data = new SlashCommandBuilder()
	.setName('setcoin')
	.setDescription('Set currency name/emote for this server')
	.addStringOption(option => option.setName('currency_name').setDescription('currency name or emote').setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
const topRich = new SlashCommandBuilder()
	.setName('top_rich')
	.setDescription('List of the richest members of the server')
  commands.push(data);
  commands.push(topRich);
  //console.log(commands);
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