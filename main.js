let fs = require('fs');
let gui = require('nw.gui');
let log = require('./utilities/log');
let sql = require('./db/sql');
let path = require('path');
sql.dbCreateTable();
let menuBar = new nw.Menu({ type: 'menubar' });
let fileSubMenu = new nw.Menu();
fileSubMenu.append(
  new nw.MenuItem({
    label: 'New',
    click: () => {
      var new_win = gui.Window.open('./test.html');

      // And listen to new window's focus event
      new_win.on('focus', function() {
        console.log('New window is focused');
      });
    }
  })
);
fileSubMenu.append(
  new nw.MenuItem({
    label: 'Open'
  })
);
fileSubMenu.append(
  new nw.MenuItem({
    label: 'Exit',
    click: () => {
      nw.process.exit();
    }
  })
);
menuBar.append(
  new nw.MenuItem({
    label: 'File',
    submenu: fileSubMenu
  })
);
nw.Window.get().menu = menuBar;

// Create an empty context menu
let menu = new nw.Menu();

// Add some items with label
menu.append(
  new nw.MenuItem({
    label: 'Item A',
    click: function() {
      var new_win = gui.Window.open('./test.html');

      // And listen to new window's focus event
      new_win.on('focus', function() {
        console.log('New window is focused');
      });
    }
  })
);
menu.append(new nw.MenuItem({ label: 'Item B' }));
menu.append(new nw.MenuItem({ type: 'separator' }));
menu.append(new nw.MenuItem({ label: 'Item C' }));

// Hooks the "contextmenu" event
document.body.addEventListener(
  'contextmenu',
  function(ev) {
    // Prevent showing default context menu
    ev.preventDefault();
    // Popup the native context menu at place you click
    menu.popup(ev.x, ev.y);

    return false;
  },
  false
);

// Create a tray icon
var tray = new nw.Tray({ title: 'Tray', icon: 'img/psx.png' });

// Give it a menu
var menu2 = new nw.Menu();
menu2.append(new nw.MenuItem({ type: 'checkbox', label: 'box1' }));
tray.menu = menu2;

function getEl(id) {
  let el = document.getElementById(id);
  return el;
}
let createButton = getEl('createButton');
createButton.addEventListener('click', e => {
  createIniFile();
});

function createIniFile() {
  const discList = [];
  let folderNumber;
  let discs = getEl('discs').value;
  if (/;/.test(discs)) {
    let multipleDiscs = discs.split(';');
    multipleDiscs = multipleDiscs.map(l => l.split('\\'));
    discs = '';
    multipleDiscs.forEach((cueFile, i, list) => {
      let file = cueFile.pop();
      discList.push(file);
      discs += file;
      if (i !== list.length - 1) {
        discs += ',';
      }
    });
    console.log('dList ', multipleDiscs);
  } else {
    let cueFile = discs.split('\\');
    let discLength = cueFile.length;
    discs = cueFile[discLength - 1];
  }
  let title = getEl('title').value;
  let publisher = getEl('publisher').value;
  let players = getEl('players').value;
  let year = getEl('year').value;
  let usbDrive = getEl('usbDrive').value;
  let gameCover = getEl('gameCover').value;
  console.log('usb drive ', usbDrive);
  console.log(discs, title, players, year);
  // TODO: separate this block into an outer function/file
  // the following block of code writes out a file called Game.ini with the needed information for the database file.
  fs.writeFile(
    './gameDir/Game.ini',
    `[game]\nDiscs=${discs}\nTitle=${title}\nPublisher=${publisher}\nPlayers=${players}\nYear=${year}`,
    err => {
      if (err) {
        console.log('err ', err);
      }
    }
  );
  let workDirectory = getEl('workdirectory').value;
  // TODO: separate this block into an outer function/file
  fs.readdir(workDirectory, (err, files) => {
    if (err) {
      throw new Error('Error while reading directory ', err);
    }
    folderNumber = files.length + 1;
    const target = path.resolve(`${workDirectory}/${folderNumber}/GameData`);
    fs.mkdir(target, { recursive: true }, err => {
      if (err) {
        throw new Error('error ', err);
      }
      fs.copyFile('./gameDir/Game.ini', `${target}/Game.ini`, err => {
        if (err) {
          throw new Error('Error while coping "Game.ini" file ', err);
        }
        fs.copyFile('./gameDir/pcsx.cfg', `${target}/pcsx.cfg`, err => {
          if (err) {
            throw new Error('Error while coping "pcsx.cfg" file ', err);
          }
          // rename gameCover file if any.
          if (gameCover) {
            let gameCoverImage = gameCover.split('\\').pop();
            let coverImagePath = path.resolve(gameCover.replace(gameCoverImage, ''));
            console.log('path ', coverImagePath + '\\' + gameCoverImage);
            console.log('discList.length ', discList.length);
            console.log('target ', target);
            if (discList.length > 0) {
              let imgName = `${distList[0].split('.')[0]}.jpg`;
              console.log('if to');
              fs.copyFile(coverImagePath, `${target}\\${imgName}`, err => {
                if (err) {
                  console.log(err);
                  throw new Error('Error while processing game cover ', err);
                }
              });
            } else {
              let imgName = `${discs.split('.')[0]}.jpg`;
              console.log('else to');
              fs.copyFile(coverImagePath, `${target}\\${imgName}`, err => {
                if (err) {
                  throw new Error('Error while processing game cover ', err);
                }
              });
            }
          } // end of gameCover if block
        });
      });
      let gameSqlData = [title, publisher, year, players, 'CERO_A', 'QR_Code_GM', ''];
      if (discList.length > 0) {
        discList.forEach((f, i) => {
          let diskNumber = i + 1;
          let data = [folderNumber, diskNumber, f];
          sql.dbRun('INSERT INTO DISC(GAME_ID,DISC_NUMBER,BASENAME) VALUES (?,?,?)', data, err => {
            if (err) {
              log(`SQL ERROR -  ${err}`);
              console.log(err);
            }
            log('Inserted data into Disc');
          });
          console.log('file name ', f);
        });
        sql.dbRun(
          `INSERT INTO GAME(
          GAME_TITLE_STRING,PUBLISHER_NAME,RELEASE_YEAR,PLAYERS,RATING_IMAGE,
          GAME_MANUAL_QR_IMAGE,LINK_GAME_ID) VALUES (?,?,?,?,?,?,?)`,
          gameSqlData,
          err => {
            if (err) {
              log(`SQL ERROR -  ${err}`);
              console.log(err);
            }
          }
        );
      } else {
        sql.dbRun('INSERT INTO DISC(GAME_ID,DISC_NUMBER,BASENAME) VALUES (?,?,?)', [folderNumber, 1, discs], err => {
          if (err) {
            log(`SQL ERROR -  ${err}`);
            console.log('Error ', err);
          }
          log('Inserted data into Disc');
        });
        sql.dbRun(
          `INSERT INTO GAME(
          GAME_TITLE_STRING,PUBLISHER_NAME,RELEASE_YEAR,PLAYERS,RATING_IMAGE,
          GAME_MANUAL_QR_IMAGE,LINK_GAME_ID) VALUES (?,?,?,?,?,?,?)`,
          gameSqlData,
          err => {
            if (err) {
              log(`SQL ERROR -  ${err}`);
              console.log(err);
            }
          }
        );
      }
    });
    console.log('files => ', files);
  });
}
