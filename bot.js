require('dotenv').config()
const { Client, GatewayIntentBits, Intents } = require('discord.js');
const allIntents = 131071;
const client = new Client({ intents: allIntents });
const keepAlive = require("./server")
const token = process.env['token']
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  console.log(interaction);
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
});


client.on('messageCreate', (interaction) => {
  console.log(interaction);
  if(interaction.author.bot) return;
  if(interaction.content.includes("PogU")){
    interaction.reply("<:PogU:477220692887076874>");
  }
});
//messageCreate

keepAlive();
client.login(token);