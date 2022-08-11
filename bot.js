import fetch from 'node-fetch'
import dotenv from 'dotenv'
import * as db from './persistence/dbManager.js'
import {discordUser} from './models/discordUser.js'
import * as enums from './models/enums.js'
import {keepAlive} from "./server.js"
import { Client, GatewayIntentBits, EmbedBuilder} from 'discord.js'

dotenv.config()

const allIntents = 131071;
const client = new Client({ intents: allIntents });
const token = process.env['token'];
//const databaseConnection = process.env['db_connection'];
//const databaseKey = process.env['x-apikey'];



client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const Guilds = client.guilds.cache.map(guild => guild);
    console.log(Guilds);
});

client.on('interactionCreate', async interaction => {
  //console.log(interaction);
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'beg') {
    console.log(interaction.user.username + "(" + interaction.user.id + ") begged for cash")
    await interaction.deferReply();
    interaction.user.displayAvatarURL
    db.getUserById(interaction.user.id, interaction, beg);
  }
});

async function beg(user){
  //console.log(interaction.user);
  if(!user.canAct(enums.Actions.beg.CooldownField)){
    let secondsLeft = user.SecondsUntilCanAct(enums.Actions.beg.CooldownField);
    await user.interaction.editReply(`${Math.round(secondsLeft/60)} minutes until you can beg again.`);
    return;
  }
  let cash = user.beg();
  let userAvatar = user.interaction.user.displayAvatarURL({ size: 32, dynamic: true });
  let exampleEmbed = new EmbedBuilder()
    .setColor(0x9d3dd4)
    .setTitle("Begging")
    //.setAuthor({ name: user.name, iconURL: userAvatar })
    .setDescription(`${user.name} begged for pennies and received **${cash}** EcilaCoins.`)
    .setImage('https://cdn2.iconfinder.com/data/icons/people-need-help/49/people-04-512.png')
    //.setThumbnail('https://cdn2.iconfinder.com/data/icons/people-need-help/49/people-04-512.png')
    .addFields({ name: `${user.name} Total Cash`, value: `${user.cash}`, inline: true })
    .setTimestamp()
    .setFooter({ text: `${user.name}`, iconURL: `${userAvatar}` });
  //interaction.user.toString() + " won " + cash + " EcilaCoins\nNew balance:" + (user.cash+cash)
  
  await user.interaction.editReply({ embeds: [exampleEmbed] });
}






client.on('messageCreate', (interaction) => {
  //console.log(interaction);
  if(interaction.author.bot) return;
  if(interaction.content.includes("PogU")){
    interaction.reply("<:PogU:477220692887076874>");
  }
});
//messageCreate

keepAlive();
client.login(token);