import sqlite3 from 'sqlite3';
import { DiscordUser } from '../models/discord-user.js'
import { Actions } from '../models/enums.js';
import * as chalkThemes from '../models/chalkThemes.js'
import * as logger from '../models/logger.js'
import { DiscordGuild } from '../models/discord-guild.js';

function log(message, ...params) {
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

export async function updateCooldown(user, field, unixCooldown) {
  db.run(`UPDATE 'cooldowns' SET ${field} = '${unixCooldown}' WHERE userId = '${user.userId}'`, function (value, err) {
    if (err) {
      return console.error(err.message);
    }
  });
}

// USER ACTIONS
export async function addCashToUser(user, cash) {
  log(`Adding ${cash} coins to ${user.name}, new total: ${cash + user.cash}`);
  db.run(`UPDATE 'users' SET cash = '${user.cash + cash}' WHERE id = '${user.userId}'`, function (value, err) {
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function registerUser(userId, username, guildId) {
  return new Promise(function (resolve, reject) {
    log(`Registering user ${username}, ID:${userId}, Guild ID:${guildId}`);
    db.run(`INSERT INTO users(DiscordUserId, DiscordGuildId, name, cash) VALUES(?, ?, ?, ?)`,
      [userId, guildId, username, 0], function (value, err) {
        if (err) {
          reject(console.error(err.message));
        }
        getUserFromDb(userId, guildId).then((user) => { resolve(user); });
      });
  })
}

export async function getUserFromDb(userId, guildId) {
  return new Promise(function (resolve, reject) {
    log(`Requesting user with ID:${userId} and Guild ID:${guildId}`);

    let sql = `SELECT *
                  FROM usercd
                  WHERE userId  = "${userId}"
                  and guildId = "${guildId}"`;
    db.get(sql, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        let user = new DiscordUser(row.id, row.userId, row.guildId, row.name, row.cash, null);
        for (const [key, value] of Object.entries(Actions)) {
          user.cooldowns[value.fieldName] = row[value.fieldName];
        }

        resolve(user);
      } else {
        resolve(null);
      }
    });
  })
}

export async function getRichestUsers(interaction) {
  return new Promise(function (resolve, reject) {
    log(`Retreiving richest users`);
    let sql = `select name, cash from users where discordguildid = '${interaction.guild.id}'  order by cash desc limit 15`;
    db.all(sql, function (err, rows) {
      if (err) {
        reject(console.error(err.message));
      }
      resolve(rows);
    });
  })
}


// GUILD ACTIONS
export async function getGuilds() {
  return new Promise(function (resolve, reject) {
    let sql = `SELECT cast(id as text) as id, name, coinEmote, bank
                FROM guilds`;
    db.all(sql, function (err, rows) {
      if (err) {
        reject(console.error(err.message));
      }
      resolve(rows);
    });
  })
}

export async function getGuildFromDb(guildId) {
  return new Promise(function (resolve, reject) {
    log(`Requesting Guild with ID:${guildId}`);

    let sql = `SELECT *
                  FROM guilds
                  WHERE id = "${guildId}"`;
    db.get(sql, (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        let guild = new DiscordGuild(row.id, row.name, row.coinEmote, null, row.bank);
        resolve(guild);
      } else {
        resolve(null);
      }
    });
  })
}

export async function registerGuild(guild) {
  return new Promise(function (resolve, reject) {
    log(`Registering guild ${guild.name}|${guild.id}`);
    db.run(`INSERT INTO guilds(id, name) VALUES(?, ?)`,
      [guild.id, guild.name], function (value, err) {
        if (err) {
          reject(console.error(err.message));
        }
        getGuildFromDb(guild.id).then((newGuild) => {
          newGuild.guild = guild;
          resolve(newGuild);
        });
      });
  })
}

export async function updateGuildCoin(guild, emote) {
  db.run(`UPDATE 'guilds' SET coinEmote = '${emote}' WHERE id = '${guild.id}'`, function (value, err) {
    if (err) {
      return console.error(err.message);
    }
  });
}
export async function updateGuildBank(guild, amount) {
  const totalAmount = guild.bank + amount;
  log(`Adding ${totalAmount} to guild ${guild.name}`)

  db.run(`UPDATE 'guilds' SET bank = '${totalAmount}' WHERE id = '${guild.id}'`, function (value, err) {
    if (err) {
      return console.error(err.message);
    }
  });
}

export async function getRichestGuilds() {
  return new Promise(function (resolve, reject) {
    log(`Retreiving richest guilds`);
    let sql = `select * from guilds order by bank desc limit 15`;
    db.all(sql, function (err, rows) {
      if (err) {
        reject(console.error(err.message));
      }
      resolve(rows);
    });
  })
}