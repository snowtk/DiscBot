import sqlite3 from 'sqlite3';
import { Resolver } from 'dns';

let db = new sqlite3.Database('./persistence/discbot.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, async (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        return;
        } else if (err) {
            console.error("Getting error " + err);
            exit(1);
    }
    console.log("Connected");
    getAllUsers(registerUsersLevels);

  });

  export async function getAllUsers(callback = () => {}){
    let sql = `select * from usercd`;
    db.all(sql, (err, rows) => { 
        if (err) {
          return console.error(err.message);
        }
        callback(rows);
    });
  }

  
export async function registerUsersLevels(users){
    for(var i = 0; i<users.length;i++){
        db.run(`INSERT INTO levels (userId) VALUES (${users[i].id})`,(err, rows) => { 
            if (err) {
              return console.error(err.message);
            }
            
        });
    }
  }