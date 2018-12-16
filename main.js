// let os = require('os');
// document.write('You are running on ', os.platform());
    // let fs = nw.require('fs');
    let fs = require('fs');
    var gui = require('nw.gui');
    // var win = gui.Window.get();


    let menuBar = new nw.Menu({type: 'menubar'});
    let fileSubMenu = new nw.Menu();
    fileSubMenu.append(new nw.MenuItem({
        label: 'New',
        click: () => {
            
            var new_win = gui.Window.open('./test.html');

        // And listen to new window's focus event
        new_win.on('focus', function() {
          console.log('New window is focused');
        });
        }
    }));
    fileSubMenu.append(new nw.MenuItem({
        label: 'Open'
    }));
    fileSubMenu.append(new nw.MenuItem({
        label: 'Exit',
        click: () => {
            nw.process.exit();
        }
    }));
    menuBar.append(new nw.MenuItem({
        label: "File",
        submenu: fileSubMenu
    }))
    nw.Window.get().menu = menuBar;

    // Create an empty context menu
    let menu = new nw.Menu();
    
    // Add some items with label
    menu.append(new nw.MenuItem({
      label: 'Item A',
      click: function(){
        var new_win = gui.Window.open('./test.html');

        // And listen to new window's focus event
        new_win.on('focus', function() {
          console.log('New window is focused');
        });
        
      }
    }));
    menu.append(new nw.MenuItem({ label: 'Item B' }));
    menu.append(new nw.MenuItem({ type: 'separator' }));
    menu.append(new nw.MenuItem({ label: 'Item C' }));
    
    // Hooks the "contextmenu" event
    document.body.addEventListener('contextmenu', function(ev) {
      // Prevent showing default context menu
      ev.preventDefault();
      // Popup the native context menu at place you click
      menu.popup(ev.x, ev.y);
    
      return false;
    }, false);


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

    let discs = getEl('discs').value;
    if(/;/.test(discs)) {
        let discList = discs.split(';');
        discList = discList.map(l => l.split('\\'));
        discs = '';
        discList.forEach((cueFile,i ,list ) => {
            discs += cueFile.pop();
            if (i !== list.length-1) {
                discs+=','
            }
        })
        console.log('dList ', discList);
    } else {
        let cueFile = discs.split('\\');
        let discLength = cueFile.length;
        discs = cueFile[discLength-1];
    }
    let title = getEl('title').value;
    let publisher = getEl('publisher').value;
    let players = getEl('players').value;
    let year = getEl('year').value;
    console.log(discs,title,players,year);
    fs.writeFile('./gameDir/Game.ini',`[game]\nDiscs=${discs}\nTitle=${title}\nPublisher=${publisher}\nPlayers=${players}\nYear=${year}`,
    (err) => {
        if(err) {
            console.log('err ', err);
        }
    })
    let workDirectory = getEl('workdirectory').value;
    fs.readdir(workDirectory, (err, files) => {
        if (err) {
            throw new Error('Error while reading directory ', err);
        }
        let folderNumber = files.length+1;
        let target = `${workDirectory}/${folderNumber}/GameData`;
        fs.mkdir(target,{ recursive: true }, (err) => {
            if (err) {
                throw new Error('error ',err);
            }
            fs.copyFile('./gameDir/Game.ini',`${target}/Game.ini`, (err) => {
                if(err) {
                    throw new Error('Error while coping "Game.ini" file ', err);
                }
                fs.copyFile('./gameDir/pcsx.cfg',`${target}/pcsx.cfg`, (err) => {
                    if(err) {
                        throw new Error('Error while coping "pcsx.cfg" file ', err);
                    }
                })
            })

        })
        console.log('files => ', files);
    });
    console.log(workDirectory);

}

//v // Remove the tray
// tray.remove();
// tray = null;