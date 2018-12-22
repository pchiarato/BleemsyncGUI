let log = require('../utilities/log');
let sqlite3 = require('sqlite3').verbose();
const sql = {
  dbConnect: () => {
    return new Promise((resolve, reject) => {
      let db = new sqlite3.Database('./db/regional.db');
      resolve(db);
    });
  },
  dbCreateTable: () => {
    sql.dbConnect().then(dbInstance => {
      dbInstance.serialize(() => {
        dbInstance.run(
          'CREATE TABLE IF NOT EXISTS "DISC" ("DISC_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "GAME_ID" INTEGER NOT NULL, "DISC_NUMBER" INTEGER NOT NULL,BASENAME TEXT)',
          (result, err) => {
            if (err) {
              log(`Error: ${err}`);
              console.log('err ', err);
            }
            log('Created "DISC" table');
          }
        );
        dbInstance.run(
          'CREATE TABLE IF NOT EXISTS "GAME" ("GAME_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "GAME_TITLE_STRING" TEXT NULL, "PUBLISHER_NAME" TEXT NULL,"RELEASE_YEAR" INTEGER NOT NULL, "PLAYERS" INTEGER NOT NULL, "RATING_IMAGE" TEXT NULL, "GAME_MANUAL_QR_IMAGE" TEXT NULL, "LINK_GAME_ID" TEXT NULL)',
          (result, err) => {
            if (err) {
              log(`Error: ${err}`);
              console.log('err ', err);
            }
            log('Created "GAME" table');
          }
        );
        dbInstance.run('CREATE INDEX IF NOT EXISTS "IX_DISC_GAME_ID" ON "DISC" ("GAME_ID")', (result, err) => {
          if (err) {
            log(`Error: ${err}`);
            console.log('err ', err);
          }
          log('Created "INDEX" table');
        });
      });
    });
  },
  dbRun: (sqlCommand, data, callback) => {
    sql.dbConnect().then(dbInstance => {
      dbInstance.run(sqlCommand, data, callback);
      log('Ran insert statement');
    });
  }
};
module.exports = sql;
