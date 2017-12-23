const electron = require('electron');
const {BrowserWindow} = require('electron');
const app = electron.app;
const fs = require('fs')
let mainWindow;

const {Menu} = require('electron')

const template = [
    {
        label: 'Edit',
        submenu: [
            {role: 'undo'},
            {role: 'redo'},
            {type: 'separator'},
            {role: 'cut'},
            {role: 'copy'},
            {role: 'paste'},
            {role: 'pasteandmatchstyle'},
            {role: 'delete'},
            {role: 'selectall'}
        ]
    },
    {
        label: 'View',
        submenu: [
            {role: 'reload'},
            {role: 'forcereload'},
            {role: 'toggledevtools'},
            {type: 'separator'},
            {role: 'resetzoom'},
            {role: 'zoomin'},
            {role: 'zoomout'},
            {type: 'separator'},
            {role: 'togglefullscreen'}
        ]
    },
    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More Electron',
                click() {
                    require('electron').shell.openExternal('https://electron.atom.io')
                }
            }
        ]
    }
]

if (process.platform === 'darwin') {
    template.unshift({
        label: app.getName(),
        submenu: [
            {role: 'about'},
            {type: 'separator'},
            {role: 'services', submenu: []},
            {type: 'separator'},
            {role: 'hide'},
            {role: 'hideothers'},
            {role: 'unhide'},
            {type: 'separator'},
            {role: 'quit'}
        ]
    })

    // Edit menu
    template[1].submenu.push(
        {type: 'separator'},
        {
            label: 'Speech',
            submenu: [
                {role: 'startspeaking'},
                {role: 'stopspeaking'}
            ]
        }
    )

    // Window menu
    template[3].submenu = [
        {role: 'close'},
        {role: 'minimize'},
        {role: 'zoom'},
        {type: 'separator'},
        {role: 'front'}
    ]
}



function initialize() {
    let shouldQuit = makeSingleInstance();
    if (shouldQuit) return app.quit();


    function createWindow() {
        const windowOptions = {
            width: 1080,
            minWidth: 680,
            height: 840,
            title: app.getName(),
            titleBarStyle: 'hiddenInset',
            frame: false,
            webPreferences: {
                nodeIntegration: false,
                minimumFontSize: 12,
                defaultFontFamily: "Monaco",

            }
        };

        mainWindow = new BrowserWindow(windowOptions);
        mainWindow.loadURL('http://localhost:8888');


        mainWindow.on('closed', () => {
            mainWindow = null
        })

        mainWindow.webContents.on('new-window', function (event, url) {
            event.preventDefault();
            console.log(url)
            mainWindow.loadURL(url)
        });

        mainWindow.webContents.on('did-finish-load', function () {

            fs.readFile(__dirname + '/custom.css', "utf-8", function (error, data) {
                if (!error) {
                    var formatedData = data.replace(/\s{2,10}/g, ' ').trim()
                    mainWindow.webContents.insertCSS(formatedData)
                }
            })
        })

        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    }

    app.on('ready', function () {
        createWindow()
    });

    app.on('window-all-closed', function () {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    });

    app.on('activate', function () {
        if (mainWindow === null) {
            createWindow()
        }
    })
}

function makeSingleInstance() {
    if (process.mas) return false;

    return app.makeSingleInstance(function () {
        if (mainWindow) {
            if (mainWindow.isMinimized()) {
                mainWindow.restore()
            }
            mainWindow.focus()
        }
    })
}


// Handle Squirrel on Windows startup events
switch (process.argv[1]) {
    case '--squirrel-install':
        autoUpdater.createShortcut(function () {
            app.quit();
        });
        break;
    case '--squirrel-uninstall':
        autoUpdater.removeShortcut(function () {
            app.quit();
        });
        break;
    case '--squirrel-obsolete':
    case '--squirrel-updated':
        app.quit();
        break;
    default:
        initialize()
}
