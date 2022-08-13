import sqlite3 from 'sqlite3';
import {discordUser} from '../models/discordUser.js'
import { Actions } from '../models/enums.js';

let db = new sqlite3.Database('./persistence/discbot.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        return;
        } else if (err) {
            console.log("Getting error " + err);
            exit(1);
    }
    console.log("Connected to the database")
  });

export async function addCash(user, cash){
  console.log("adding " + user.cash + " " + cash + " cash to " + user.name + user.userId)
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
    console.log(`registering user ${interaction.user.username} with discord id:${interaction.user.id} and guild id:${interaction.guild.id}`);
    db.run(`INSERT INTO users(discordUserId, discordGuildId, guildName, name, cash) VALUES(?, ?, ?, ?, ?)`,
     [interaction.user.id,interaction.guild.id, interaction.guild.name, interaction.user.username, 0], function(value, err){
      if (err) {
        return console.error(err.message);
      }
      getUser(interaction, callback, hook);
    });
}

export async function getUser(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
    console.log(`asking bd for the user with id ${interaction.user.id} and guild id ${interaction.guild.id}`);
    
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
          console.log(user);
          hook(user, interaction, callback);
        }else{
          registerUser(interaction,callback, hook, errorCallback);
        }
    });
}


export async function getUserFromMessage(interaction, callback = () => {}, hook = () => {}, errorCallback = () => {}){
  console.log(`asking bd for the user with id ${interaction.author.id} and guild id ${interaction.guildId}`);
  
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
  console.log(`registering user ${interaction.author.username} with discord id:${interaction.author.id} and guild id:${interaction.guildId}`);
  db.run(`INSERT INTO users(discordUserId, discordGuildId, name, cash) VALUES(?, ?, ?, ?)`,
   [interaction.author.id,interaction.guildId, interaction.author.username, 0], function(value, err){
    if (err) {
      return console.error(err.message);
    }
    getUserFromMessage(interaction, callback, hook);
  });
}

export async function getRichestUsers(interaction, callback = () => {}, errorCallback = () => {}){
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
    console.log("loading guilds");   
    let sql = `SELECT cast(id as text) as id, name, coinEmote
                FROM guilds`;
    db.all(sql, (err, rows) => { 
        if (err) {
          return console.error(err.message);
        }
        //console.log(rows);
        callback(cachedGuilds,rows);
    });
}

export async function registerGuild(guild, callback = () => {}, errorCallback = () => {}){
  console.log(`registering guild ${guild.name}`);
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