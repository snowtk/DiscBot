import dotenv from 'dotenv'
import * as expressServer from "./server.js"
import { Client } from 'discord.js'
import { actions } from './commands/action-commands.js'
import { RepositoryHandler } from './persistence/repository.js'
import { Actions } from './models/enums.js'
import * as logger from './shared/logger.js'
import * as chalkThemes from './shared/chalkThemes.js'

dotenv.config()

function log(message, ...params) {
  logger.log(chalkThemes.main(message), ...params);
}

const allIntents = 131071;
const client = new Client({ intents: allIntents });
const token = process.env.token;

const repo = new RepositoryHandler().getInstance();
repo.client = client;
client.guilds.cache
log(chalkThemes.setup(`--------------------- INIT -----------------------`));
client.on('ready', () => {
  log(chalkThemes.setup(`Logged in as ${client.user.tag}!`));
  repo.validateGuilds(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const action = actions.get(interaction.commandName)
  if (action) {
    await interaction.deferReply();
    log(`${interaction.user.username} used command: ${chalkThemes.warning(interaction.commandName)}`)
    action(interaction)
  } else {
    log(`${interaction.user.username} used command: ${chalkThemes.error(interaction.commandName)}`)
  }
});

async function activityReward(user) {
  if (!user.canAct(Actions.chatActivity.fieldName)) {
    return;
  }
  log(`${user.name} is eligible for activity token reward`);
  user.getActivityReward();
  let coinEmoji = "🪙";

  const guild = await repo.getGuild(user.guildId);
  if (guild.guild.emojis.cache.find(emoji => emoji.toString() === guild.coinEmote)) {
    coinEmoji = guild.coinEmote;
  }
  await user.interaction.react(coinEmoji);
}

client.on('messageCreate', async (interaction) => {
  if (interaction.author.bot) return;
  log(`${interaction.author.username} talked in ${interaction.guildId}`);
  const author = await repo.getUser(interaction.author.id, interaction.guildId, interaction);
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
