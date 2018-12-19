let log = require('../utilities/log');
let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./db/regional.db');
let sqliteDB = () => {
  db.serialize(() => {
    db.run(
      'CREATE TABLE IF NOT EXISTS "DISC" ("DISC_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "GAME_ID" INTEGER NOT NULL, "DISC_NUMBER" INTEGER NOT NULL,BASENAME TEXT)',
      (result, err) => {
        if (err) {
          log(`Error: ${err}`);
          console.log('err ', err);
        }
        log('Created "DISC" table');
      }
    );
    db.run(
      'CREATE TABLE IF NOT EXISTS "GAME" ("GAME_ID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "GAME_TITLE_STRING" TEXT NULL, "PUBLISHER_NAME" TEXT NULL,"RELEASE_YEAR" INTEGER NOT NULL, "PLAYERS" INTEGER NOT NULL, "RATING_IMAGE" TEXT NULL, "GAME_MANUAL_QR_IMAGE" TEXT NULL, "LINK_GAME_ID" TEXT NULL)',
      (result, err) => {
        if (err) {
          log(`Error: ${err}`);
          console.log('err ', err);
        }
        log('Created "GAME" table');
      }
    );
    db.run('CREATE INDEX IF NOT EXISTS "IX_DISC_GAME_ID" ON "DISC" ("GAME_ID")', (result, err) => {
      if (err) {
        log(`Error: ${err}`);
        console.log('err ', err);
      }
      log('Created "INDEX" table');
    });
    db.run('INSERT INTO DISC(GAME_ID,DISC_NUMBER,BASENAME) VALUES (?,?,?)', [2, 2, 'SLUS-00594'], err => {
      if (err) {
        log(`Error: ${err}`);
        console.log('error ', err);
      }
      log('Inserted values into "DISC" table');
    });
  });
  db.close();
};

module.exports = sqliteDB;
