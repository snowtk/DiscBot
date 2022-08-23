import dotenv from 'dotenv'
import * as db from './persistence/dbManager.js'
import *  as enums from './models/enums.js'
import * as expressServer from "./server.js"
import { Client, EmbedBuilder } from 'discord.js'
import * as chalkThemes from './models/chalkThemes.js'
import * as logger from './models/logger.js'
import { actions } from './commands/action-commands.js'
import { getUser, validadeGuilds } from './models/utils.js'
import { CacheHandler } from './persistence/cache/cache-handler.js'

dotenv.config()

function log(message, ...params) {
  logger.log(chalkThemes.main(message), ...params);
}

const allIntents = 131071;
const client = new Client({ intents: allIntents });
const token = process.env.token;
const cache = new CacheHandler().getInstance();

log(chalkThemes.setup(`--------------------- INIT -----------------------`));
client.on('ready', () => {
  log(chalkThemes.setup(`Logged in as ${client.user.tag}!`));
  db.getGuilds(client.guilds.cache.map(guild => guild), validadeGuilds);
});


client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;
  const action = actions.get(interaction.commandName)
  if (action) {
    log(`${interaction.user.username} used command: ${chalkThemes.warning(interaction.commandName)}`)
    action(interaction)
  } else {
    log(`${interaction.user.username} used command: ${chalkThemes.error(interaction.commandName)}`)
  }


  if (interaction.commandName === 'give_coins') {
    await interaction.deferReply();
    let amount = interaction.options.getInteger('amount');
    let target = interaction.options.getUser('target');
    let giver = await getUser(interaction.user.id, interaction.guild.id, interaction);
    let interactionCopy = Object.assign({}, interaction);
    interactionCopy.user = target;
    let taker = await getUser(target.id, interaction.guild.id, interactionCopy);
    giveCoins(giver, taker, amount, interaction);
  }

  if (interaction.commandName === 'beg') {
    await interaction.deferReply();
    getUser(interaction.user.id, interaction.guild.id, interaction).then(user => beg(user));

  }
});

async function giveCoins(giver, taker, amount, interaction) {
  let description = "";
  if (giver.cash >= amount) {
    giver.giveCash(taker, amount);
    description = `${giver.interaction.user.toString()} has given ${amount} ${cache.guilds[interaction.guild.id].coinEmote} to ${taker.interaction.user.toString()}`
  } else {
    description = `You don't have enough ${cache.guilds[interaction.guild.id].coinEmote}`
  }
  let exampleEmbed = new EmbedBuilder()
    .setColor(enums.Color.purple)
    .setTitle('Charity')
    .setDescription(description)
    .setTimestamp();

  await interaction.editReply({ embeds: [exampleEmbed] });
}

async function beg(user) {
  if (!user.canAct(enums.Actions.beg.fieldName)) {
    let secondsLeft = user.secondsUntilCanAct(enums.Actions.beg.fieldName);
    await user.interaction.editReply(`${Math.round(secondsLeft / 60)} minutes until you can beg again.`);
    return;
  }
  let cash = user.beg();
  let userAvatar = user.interaction.user.displayAvatarURL({ size: 32, dynamic: true });
  let exampleEmbed = new EmbedBuilder()
    .setColor(enums.Color.purple)
    .setTitle("Begging")
    //.setAuthor({ name: user.name, iconURL: userAvatar })
    .setDescription(`${user.name} begged for pennies and received **${cash}** ${cache.guilds[user.guildId].coinEmote}.`)
    //.setImage('https://cdn3.iconfinder.com/data/icons/human-trafficking/236/human-traffiking-trade-003-512.png')
    .setThumbnail('https://cdn3.iconfinder.com/data/icons/human-trafficking/236/human-traffiking-trade-003-512.png')
    .addFields({ name: `${user.name} Total Cash`, value: `${user.cash} ${cache.guilds[user.guildId].coinEmote}`, inline: true })
    .setTimestamp()
    .setFooter({ text: `${user.name}`, iconURL: `${userAvatar}` });
  //interaction.user.toString() + " won " + cash + " EcilaCoins\nNew balance:" + (user.cash+cash)

  await user.interaction.editReply({ embeds: [exampleEmbed] });
}

async function activityReward(user) {
  //log(interaction.user);
  if (!user.canAct(enums.Actions.chatActivity.fieldName)) {
    return;
  }
  log(`${user.name} is eligible for activity token reward`);
  user.getActivityReward();
  let coinEmoji = "🪙";
  if (cache.guilds[user.guildId].guild.emojis.cache.find(emoji => emoji.toString() === cache.guilds[user.guildId].coinEmote)) {
    coinEmoji = cache.guilds[user.guildId].coinEmote;
  }
  await user.interaction.react(coinEmoji);
}

client.on('messageCreate', async (interaction) => {
  if (interaction.author.bot) return;
  log(`${interaction.author.username} talked in ${interaction.guildId}`);
  let author = await getUser(interaction.author.id, interaction.guildId, interaction);
  activityReward(author);
});
/*
expressServer.server.all("/users/", (req, res) => {
  res.send("<pre><code>" + JSON.stringify(users, null, '  ') + "</code></pre>")
})
expressServer.server.all("/guilds/", (req, res) => {
  res.send("<pre><code>" + JSON.stringify(guilds, null, '  ') + "</code></pre>")
})
*/
expressServer.keepAlive();
client.login(token);
