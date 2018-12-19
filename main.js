let fs = require('fs');
let gui = require('nw.gui');
// let log = require('./logs/sql.log');
let sql = require('./db/sql');

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
function createIniFile() {
  let discList = [];
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
    let folderNumber = files.length + 1;
    let target = `${workDirectory}/${folderNumber}/GameData`;
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
        });
      });
    });
    console.log('files => ', files);
  });

  if (discList.length > 0) {
    discList.forEach(f => {
      console.log('file name ', f);
    });
  }
  // END:TODO
  console.log(workDirectory);
  // sql();
  // db.run('INSERT INTO DISC(GAME_ID,DISC_NUMBER,BASENAME) VALUES (?,?,?)', [folderNumber, 2, 'SLUS-00594'], err => {
  //   if (err) {
  //     console.log('error ', err);
  //   }
  // });
  // insert Game.ini info into the db
}

//v // Remove the tray
// tray.remove();
// tray = null;
