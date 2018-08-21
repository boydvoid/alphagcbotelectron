var tmi = require("tmi.js");
const electron = require('electron');
require('dotenv/config');
var fs = require('fs');

const BrowserWindow = electron.remote.BrowserWindow;


//chat src embed
var getUserName = fs.readFileSync('user.json');
var channelName = JSON.parse(getUserName);
console.log(channelName);
document.getElementById('chat_embed').src = "http://www.twitch.tv/embed/" + channelName + "/chat"


//window controls
var win = BrowserWindow.getFocusedWindow();
var min = document.getElementById('min');
var max = document.getElementById('max');
var close = document.getElementById('close');

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
    channels: ["#alphagc"]
};

var client = new tmi.client(options);

// Connect the client to the server..
client.connect();

console.log(client.readyState());

var canUse = true;


var commands = [
    { "com": "!learn", "mes": "Wolves are AlphaGC's currency. You get 5 wolf every 10 minutes you watch the stream. You can also earn wolves by dueling someone, !duel [persons name] or doing other minigames like !ffa, !boss, and !Heist. Try them out! ", "canUse": canUse },
    { "com": "!duel", "mes": "Can't Duel Yet.", "canUse": canUse }

];

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
                client.action("alphagc", commands[i].mes);

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