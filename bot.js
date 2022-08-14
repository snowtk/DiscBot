import fetch from 'node-fetch'
import dotenv from 'dotenv'
import * as db from './persistence/dbManager.js'
import {discordUser, getUnixTime} from './models/discordUser.js'
import {discordGuild} from './models/discordGuild.js'
import * as enums from './models/enums.js'
import * as expressServer from "./server.js"
import { Client, GatewayIntentBits, EmbedBuilder} from 'discord.js'
import * as chalkThemes from './models/chalkThemes.js'
import * as logger from './models/logger.js'
import * as readline from 'readline'

dotenv.config()

function log(message, ...params){
  logger.log(chalkThemes.main(message), ...params);
}

const allIntents = 131071;
const client = new Client({ intents: allIntents });
const token = process.env['token'];
let guilds = {};
let users = {};
let userCacheSize = 100;

log(chalkThemes.setup(`--------------------- INIT -----------------------`));
client.on('ready', () => {
  log(chalkThemes.setup(`Logged in as ${client.user.tag}!`));
  db.getGuilds(client.guilds.cache.map(guild => guild), validadeGuilds);
});

async function validadeGuilds(cachedGuilds,dbGuilds){
  log(chalkThemes.setup(`Loading guilds`));
  let dbDict = Object.assign({}, ...dbGuilds.map((x) => ({[x.id]: x})));
  //log(cachedGuilds);
  for(var i = 0; i < cachedGuilds.length; i++){
    if(dbDict[cachedGuilds[i].id]){
      let dbGuild= dbDict[cachedGuilds[i].id];
      guilds[cachedGuilds[i].id] = new discordGuild(dbGuild.id, dbGuild.name, dbGuild.coinEmote);
      guilds[cachedGuilds[i].id].guild = cachedGuilds[i];
    }else{
      db.registerGuild(cachedGuilds[i]);
      guilds[cachedGuilds[i].id] = new discordGuild(cachedGuilds[i].id, cachedGuilds[i].name);
      guilds[cachedGuilds[i].id].guild = cachedGuilds[i];
    }
  }
  log(chalkThemes.setup(`--------------------------------------------------`));
}

client.on('interactionCreate', async interaction => {
  //log(interaction);
  if (!interaction.isChatInputCommand()) return;
  log(`${interaction.user.username} used command: ${chalkThemes.warning(interaction.commandName)}`)

  if (interaction.commandName === 'top_rich') {
    await interaction.deferReply();
    db.getRichestUsers(interaction, topRichest);
  }

  if (interaction.commandName === 'setcoin') {
    let newCoinName =  interaction.options.getString("currency_name");
    guilds[interaction.guild.id].setCoin(newCoinName);
    await interaction.reply(`${newCoinName} is the new currency in ${interaction.guild.name}`);
  }

  if (interaction.commandName === 'beg') {
    await interaction.deferReply();
    if(users[(interaction.user.id, interaction.guild.id)]){
      userFound(users[(interaction.user.id, interaction.guild.id)], interaction, beg);
    }else{
      db.getUser(interaction, beg, userFound);
    }
    
  }
});

async function topRichest(userList, interaction){
  let list = "";
  for(var i = 0; i < userList.length; i++){
    list += `**#${i+1} - ${userList[i].name}** - ${userList[i].cash} ${guilds[interaction.guild.id].coinEmote}\n`
  }
  let exampleEmbed = new EmbedBuilder()
    .setColor(0x9d3dd4)
    .setTitle(`TOP ${userList.length} RICHEST`)
    .setDescription(list)
    .setTimestamp();
  
  await interaction.editReply({ embeds: [exampleEmbed] });
}

async function userFound(user, interaction, callback = () =>{}){
  user.lastRequest = getUnixTime();
  user.setInteraction(interaction); 

  if(!users[user.discordId + user.guildId]){
      users[user.discordId + user.guildId] = user;
  }
  if(Object.keys(users).length > userCacheSize){
    var keys   = Object.keys(users);
    var lowest = Math.min.apply(null, keys.map(function(x) { return users[x].lastRequest} ));
    var match  = keys.filter(function(y) { return users[y].lastRequest === lowest });
    delete users[match];
  }
  callback(user);
}

async function beg(user){
  //log(interaction.user);
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
    .setDescription(`${user.name} begged for pennies and received **${cash}** ${guilds[user.guildId].coinEmote}.`)
    .setImage('https://cdn3.iconfinder.com/data/icons/human-trafficking/236/human-traffiking-trade-003-512.png')
    //.setThumbnail('https://cdn2.iconfinder.com/data/icons/people-need-help/49/people-04-512.png')
    .addFields({ name: `${user.name} Total Cash`, value: `${user.cash} ${guilds[user.guildId].coinEmote}`, inline: true })
    .setTimestamp()
    .setFooter({ text: `${user.name}`, iconURL: `${userAvatar}` });
  //interaction.user.toString() + " won " + cash + " EcilaCoins\nNew balance:" + (user.cash+cash)
  
  await user.interaction.editReply({ embeds: [exampleEmbed] });
}

async function activityReward(user){
  //log(interaction.user);
  if(!user.canAct(enums.Actions.chatActivity.CooldownField)){
    return;
  }
  log(`${user.name} is eligible for activity token reward`);
  user.getActivityReward();
  let coinEmoji = "🪙";
  if(guilds[user.guildId].guild.emojis.cache.find(emoji => emoji.toString() === guilds[user.guildId].coinEmote)){
    coinEmoji = guilds[user.guildId].coinEmote;
  }
  await user.interaction.react(coinEmoji);
}

client.on('messageCreate', (interaction) => {
  //log(interaction);
  if(interaction.author.bot) return;
  log(`${interaction.author.username} talked in ${interaction.guildId}`);
  //log(users[interaction.author.id+interaction.guildId]);
  if(users[interaction.author.id+interaction.guildId]){
    log(`${interaction.author.username} in cache`);
    userFound(users[interaction.author.id+interaction.guildId], interaction, activityReward);
  }else{
    log(`Getting ${interaction.author.username} from database`)
    db.getUserFromMessage(interaction, activityReward, userFound);
  }
});
//messageCreate

expressServer.server.all("/users/", (req, res) => {
  res.send("<pre><code>" + JSON.stringify(users, null, '  ')+"</code></pre>")
})
expressServer.server.all("/guilds/", (req, res) => {
  res.send("<pre><code>" + JSON.stringify(guilds, null, '  ')+"</code></pre>")
})
expressServer.keepAlive();
client.login(token);