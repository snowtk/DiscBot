import sqlite3 from 'sqlite3';
import {discordUser} from '../models/discordUser.js'
import { Actions } from '../models/enums.js';
import * as chalkThemes from '../models/chalkThemes.js'
import * as logger from '../models/logger.js'
import { Resolver } from 'dns';

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

export async function registerUser(userId, username, guildId){
  return new Promise(function(resolve,reject) {
    log(`Registering user ${username}, ID:${userId}, Guild ID:${guildId}`);
    db.run(`INSERT INTO users(discordUserId, discordGuildId, name, cash) VALUES(?, ?, ?, ?)`,
     [userId, guildId, username, 0], function(value, err){
      if (err) {
        reject(console.error(err.message));
      }
      getUser(userId,  guildId).then((user)=> {resolve(user);});
    });
  })
}

export async function getUser(userId, guildId){
    return new Promise(function(resolve,reject) {
      log(`Requesting user with ID:${userId} and Guild ID:${guildId}`);
    
      let sql = `SELECT *
                  FROM usercd
                  WHERE userId  = "${userId}"
                  and guildId = "${guildId}"`;
      db.get(sql, (err, row) => { 
          if (err) {
            return console.error(err.message);
          }
          if(row){
            let user = new discordUser(row.id, row.userId, row.guildId, row.name, row.cash, null);
            for (const [key, value] of Object.entries(Actions)) {
              user.cooldowns[value.CooldownField] = row[value.CooldownField];
            }
            //log(user);
            //hook(user, interaction, callback);
            resolve(user);
          }else{
            resolve(null);
            //registerUser(interaction).then(() => {getUser(interaction).then((user) => {resolve(user)});});
          }
      });
    })
    
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