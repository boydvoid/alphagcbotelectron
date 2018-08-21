const electron = require('electron');
const url = require('url');
const path = require('path');

var fs = require('fs');

// var checkToken = fs.readFileSync('token.json');
// var token = JSON.parse(checkToken);

const { app, BrowserWindow } = electron;

let mainWindow;
let loginWindow;
// listen for app to be ready 
app.on('ready', function () {
    //create new window
    mainWindow = new BrowserWindow({
        minWidth: 1280,
        minHeight: 800,
        width: 1280,
        height: 800,
        frame: false
    });
    //load html file

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './views/index.html'),
        protocol: 'file:',
        slashes: true
    }));

    if (!fs.existsSync('user.json')) {
        loginWindow = new BrowserWindow({
            width: 360,
            height: 640
        });
        loginWindow.loadURL(url.format({
            pathname: path.join(__dirname, './views/login.html'),
            protocol: 'file:',
            slashes: true
        }));
    }
});

