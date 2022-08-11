import sqlite3 from 'sqlite3';
import {discordUser} from '../models/discordUser.js'

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
  console.log("adding " + user.cash + " " + cash + " cash to " + user.name + user.id)
  db.run(`UPDATE 'users' SET cash = '${user.cash + cash}' WHERE id = '${user.id}'`, function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function updateCooldown(user, field, unixCooldown){
  db.run(`UPDATE 'cooldowns' SET ${field} = '${unixCooldown}' WHERE userId = '${user.id}'`, function(value, err){
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function registerUser(id, interaction, callback = () => {}, errorCallback = () => {}){
    console.log("registering user with the id: " + id + "/" + interaction.user.username);
    db.run(`INSERT INTO users(id, name, cash) VALUES(?, ?, ?)`, [id, interaction.user.username, 0], function(value, err){
      if (err) {
        return console.error(err.message);
      }
      callback(new discordUser(id, interaction.user.username, 0, interaction));
    });
}

export async function getUserById(id, interaction, callback = () => {}, errorCallback = () => {}){
    console.log(`asking bd for the user with id ${id}`);
    
    let sql = `SELECT cast(id as text) as id, name, cash, jobAction
                FROM usercd
                WHERE id  = "${id}"`;
    db.get(sql, (err, row) => { 
        if (err) {
          return console.error(err.message);
        }
        if(row){
          let user = new discordUser(row.id,row.name,row.cash, interaction);
          user.cooldowns["jobAction"] = row.jobAction;
          console.log(user);
          callback(user);
        }else{
          registerUser(id,interaction,callback,errorCallback);
        }
    });
}