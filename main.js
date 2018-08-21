var tmi = require("tmi.js");
const electron = require('electron');
require('dotenv/config');
var fs = require('fs');

const BrowserWindow = electron.remote.BrowserWindow;


//get channel Name
var getUserName = fs.readFileSync('user.json');
var channelName = JSON.parse(getUserName);




//chat src embed
var getUserName = fs.readFileSync('user.json');
document.getElementById('chat_embed').src = "http://www.twitch.tv/embed/" + channelName + "/chat"


//get commands
if (!fs.existsSync('commands.json')) {
    //do something here
    console.log('no commands file');
} else {
    var getCommands = fs.readFileSync('commands.json');
    var readCommands = JSON.parse(getCommands);

    var commands = readCommands;
}


//create commands list
var html = "<table class='table-striped table-dark'>";
for (var i = 0; i < commands.length; i++) {
    html += "<tr>";
    html += "<th class='row'>";
    html += "</th>"

    html += "<td>" + commands[i].com + "</td>";
    html += "</tr>";

}
html += "</table>";

document.getElementById("box").innerHTML = html;

//window controls
var win = BrowserWindow.getFocusedWindow();
var min = document.getElementById('minBox');
var max = document.getElementById('maxBox');
var close = document.getElementById('closeBox');

min.onclick = function () {
    win.minimize();
}

max.onclick = function () {
    if (!win.isMaximized()) {
        win.maximize();
    } else {
        win.unmaximize();
    }

}

close.onclick = function () {
    win.close();
}

//bot connect

var client = new tmi.client(options);
var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: "alphagcbot",
        password: process.env.password
    },
    channels: ["#" + channelName]
};

var client = new tmi.client(options);

// Connect the client to the server..
client.connect();

console.log(client.readyState());


client.on("chat", function (channel, user, message, self) {
    // Don't listen to my own messages..
    if (self) return;

    // Do your stuff.

    //commands

    //look for matching command
    for (let i = 0; i < commands.length; i++) {

        //check to see if command has been used 
        if (commands[i].canUse == true) {

            //if it hasn't run it
            if (commands[i].com == message) {

                //send out command message
                client.action(channelName, commands[i].mes);

                //set the command use to false, so it cant be used
                commands[i].canUse = false;

            }
        }
        //see if the command can't be used, start the timer if it cant
        if (commands[i].canUse == false) {

            setTimeout(function () {
                commands[i].canUse = true;
            }, 10000);
        }
    }


});