import sqlite3 from 'sqlite3';

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
  console.log(user);
  console.log("adding " + user.cash + " " + cash + " cash to " + user.name + user.id)
  db.run(`UPDATE 'users' SET cash = '${user.cash + cash}' WHERE id = '${user.id}'`, function(value, err){
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
      callback(interaction, {id, name: interaction.user.username, cash: 0});
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
        console.log(row);
        return row
        ? callback(interaction, row)
        : registerUser(id,interaction,callback,errorCallback);
    });
}