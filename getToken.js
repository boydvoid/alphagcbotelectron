const electron = require('electron');
const url = require('url');
const path = require('path');
const axios = require('axios');
var fs = require('fs');

const { app, BrowserWindow } = electron;
const remote = require('electron').remote;
var twitchButton = document.getElementById('twitchConnect');
const mainWindow = electron.remote.BrowserWindow;


//check for file
window.onload = function () { checkTwitchButton() }

//check button function
var tokenJSON = fs.existsSync('token.json');
function checkTwitchButton() {
    if (!tokenJSON) {
        twitchButton.classList.add('getTwitch');
        twitchButton.classList.remove('gotTwitch');
        twitchButton.innerHTML = "Connect to Twitch";
    } else {
        twitchButton.classList.remove('getTwitch');
        twitchButton.classList.add('gotTwitch');
        twitchButton.innerHTML = "Twitch is Connected!";
    }
}


//onclick for the connect twitch button
twitchButton.onclick = function () {

    // Your Twitch Applications Credentials
    var options = {
        client_id: 'o5u7i8tz73y3xet18sddlu4bjzoe6m',
        response_type: 'code',
        redirect_uri: 'http://localhost',
        client_secret: 'yggjtqrxrik0pubwzx6jb88mqz3qf6',
        scopes: ["user:edit"] // Scopes limit access for OAuth tokens.
    };

    // Build the OAuth consent page URL
    var authWindow = new mainWindow({ width: 800, height: 600, show: false, 'node-integration': false });
    var twitchUrl = 'https://id.twitch.tv/oauth2/authorize?';
    var authUrl = twitchUrl + 'client_id=' + options.client_id + '&response_type=' + options.response_type + '&redirect_uri=' + options.redirect_uri + '&scope=' + options.scopes;
    authWindow.loadURL(authUrl);
    authWindow.show();

    function handleCallback(url) {
        var raw_code = /code=([^&]*)/.exec(url) || null;
        var code = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
        var error = /\?error=(.+)$/.exec(url);
        console.log(url);
        //check for two-factor auth
        if (url.indexOf("passport.twitch.tv") > -1) {
            authWindow.loadURL(url);
        } else if (code) {
            // Close the browser if code found or error
            requestTwitchToken(options, code);
            authWindow.destroy();
        }
        // If there is a code, proceed to get token from twitch
        else if (error) {
            alert('Oops! Something went wrong and we couldn\'t' +
                'log you in using twitch. Please try again.');
        }
    }

    // Handle the response from Twitch - See Update from 4/12/2015

    authWindow.webContents.on('will-navigate', function (event, url) {
        handleCallback(url);
    });

    authWindow.webContents.on('did-get-redirect-request', function (event, oldUrl, newUrl) {
        handleCallback(newUrl);
    });

    // Reset the authWindow on close
    authWindow.on('close', function () {
        authWindow = null;
    }, false);

    //request token from code received ---------------------------------------------------
    function requestTwitchToken(options, code) {
        axios.post('https://id.twitch.tv/oauth2/token?client_id=o5u7i8tz73y3xet18sddlu4bjzoe6m&client_secret=yggjtqrxrik0pubwzx6jb88mqz3qf6&code=' + code + '&grant_type=authorization_code&redirect_uri=http://localhost')
            .then(function (response, err) {
                var token = {
                    "token": "Bearer " + response.data.access_token
                }
                var data = JSON.stringify(token, null, 2);

                fs.writeFile('token.json', data, finished);
                function finished(err) {
                    console.log('written to token.json');
                }
                console.log(response.data.access_token);
                console.log(response.data);
                getTwitchInfo(token.token);

                twitchButton.classList.remove('getTwitch');
                twitchButton.classList.add('gotTwitch');
                twitchButton.innerHTML = "Twitch is Connected!";

            })
            .catch((error) => {
                console.log(error);
            });

    }
    //---------------------------------------------------

    //get user info
    function getTwitchInfo(token) {
        axios.get("https://api.twitch.tv/helix/users?", { 'headers': { 'Authorization': token } })
            .then((response => {
                var gotData = {
                    "id": response.data.data[0].id,
                    "Login": response.data.data[0].login,
                    "display_name": response.data.data[0].display_name,
                    "description": response.data.data[0].description,
                    "profile_image_url": response.data.data[0].profile_img_url,
                    "offline_image_url": response.data.data[0].offline_image_url,
                    "view_count": response.data.data[0].view_count
                }

                //stringify to json
                var data = JSON.stringify(gotData, null, 2);

                fs.writeFile('userInfo.json', data, finished_user);

                function finished_user(err) {
                    console.log('written to user.json');
                }
                console.log(response.data.data[0].login);


            }))
            .catch((error) => {
                console.log(error);
            });
    }

    //Submit Channel Name-------------------------------------------------------------
    document.getElementById('channelButton').onclick = function () {
        let indexWindow;
        var channel = document.getElementById('channelInput').value;
        var data = JSON.stringify(channel, null, 2);
        fs.writeFile('user.json', data, finished_user);
        function finished_user(err) {
            console.log('written to user.json');
        }

        //create index window after added name
        indexWindow = new mainWindow({
            minWidth: 1280,
            minHeight: 800,
            width: 1280,
            height: 800,
            frame: false
        });

        indexWindow.loadURL(url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true
        }));

        var window = remote.getCurrentWindow();
        window.close();
    }
    //------------------------------------------------------------------------

}


