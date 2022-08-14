import sqlite3 from 'sqlite3';
import {discordUser} from '../models/discordUser.js'
import { Actions } from '../models/enums.js';
import * as chalkThemes from '../models/chalkThemes.js'
import * as logger from '../models/logger.js'

function log(message, ...params){
  logger.log(chalkThemes.database(message), ...params);
}

let db = new sqlite3.Database('./persistence/discbot.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        return;
        } else if (err) {
            log(chalkThemes.error("Getting error " + err));
            exit(1);
    }
    log(chalkThemes.setup("Connected"))
  });

export async function addCash(user, cash){
  log(`Adding ${cash} coins to ${user.name}, new total: ${cash+user.cash}`);
  db.run(`UPDATE 'users' SET cash = '${user.cash + cash}' WHERE id = '${user.userId}'`, function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function updateCooldown(user, field, unixCooldown){
  db.run(`UPDATE 'cooldowns' SET ${field} = '${unixCooldown}' WHERE userId = '${user.userId}'`, function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function registerUser(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
  log(`Registering user ${interaction.user.username}, ID:${interaction.user.id}, Guild ID:${interaction.guild.id}`);
    db.run(`INSERT INTO users(discordUserId, discordGuildId, guildName, name, cash) VALUES(?, ?, ?, ?, ?)`,
     [interaction.user.id,interaction.guild.id, interaction.guild.name, interaction.user.username, 0], function(value, err){
      if (err) {
        return console.error(err.message);
      }
      getUser(interaction, callback, hook);
    });
}

export async function getUser(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
    log(`Requesting user with ID:${interaction.user.id} and Guild ID:${interaction.guild.id}`);
    
    let sql = `SELECT *
                FROM usercd
                WHERE userId  = "${interaction.user.id}"
                and guildId = "${interaction.guild.id}"`;
    db.get(sql, (err, row) => { 
        if (err) {
          return console.error(err.message);
        }
        if(row){
          let user = new discordUser(row.id, row.userId, row.guildId, row.name, row.cash, interaction);
          for (const [key, value] of Object.entries(Actions)) {
            user.cooldowns[value.CooldownField] = row[value.CooldownField];
          }
          //log(user);
          hook(user, interaction, callback);
        }else{
          registerUser(interaction,callback, hook, errorCallback);
        }
    });
}


export async function getUserFromMessage(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
  log(`Requesting user with ID:${interaction.author.id} and Guild ID:${interaction.guildId}`);
  let sql = `SELECT *
              FROM usercd
              WHERE userId  = "${interaction.author.id}"
              and guildId = "${interaction.guildId}"`;
  db.get(sql, (err, row) => { 
      if (err) {
        return console.error(err.message);
      }
      if(row){
        let user = new discordUser(row.id, row.userId, row.guildId, row.name, row.cash, interaction);
        for (const [key, value] of Object.entries(Actions)) {
          user.cooldowns[value.CooldownField] = row[value.CooldownField];
        }
        hook(user, interaction, callback);
      }else{
        registerUserFromMessage(interaction,callback, hook, errorCallback);
      }
  });
}

export async function registerUserFromMessage(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
  log(`Registering user ${interaction.author.username}, ID:${interaction.author.id}, Guild ID:${interaction.guildId}`);
  db.run(`INSERT INTO users(discordUserId, discordGuildId, name, cash) VALUES(?, ?, ?, ?)`,
   [interaction.author.id,interaction.guildId, interaction.author.username, 0], function(value, err){
    if (err) {
      return console.error(err.message);
    }
    getUserFromMessage(interaction, callback, hook);
  });
}

export async function getRichestUsers(interaction, callback = () => {}, errorCallback = () => {}){
  log(`Retreiving richest users`);
  let sql = `select name, cash from users where discordguildid = '${interaction.guild.id}'  order by cash desc limit 15`;
  db.all(sql, (err, rows) => { 
      if (err) {
        return console.error(err.message);
      }
      callback(rows, interaction);
  });
}

//select * from users order by cash desc limit 3
export async function getGuilds(cachedGuilds, callback = () => {}, errorCallback = () => {}){
    let sql = `SELECT cast(id as text) as id, name, coinEmote
                FROM guilds`;
    db.all(sql, (err, rows) => { 
        if (err) {
          return console.error(err.message);
        }
        //log(rows);
        callback(cachedGuilds,rows);
    });
}

export async function registerGuild(guild, callback = () => {}, errorCallback = () => {}){
  log(`Registering guild ${guild.name}|${guild.id}`);
  db.run(`INSERT INTO guilds(id, name) VALUES(?, ?)`,
   [guild.id, guild.name], function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function updateGuildCoin(guild, emote){
  db.run(`UPDATE 'guilds' SET coinEmote = '${emote}' WHERE id = '${guild.id}'`, function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}