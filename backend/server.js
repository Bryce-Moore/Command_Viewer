const express = require('express');
const app = express();
import { createChannel, getAccessToken, removeChannel, checkChannel } from './db'

var hostname = ''
var channelId = ''

// Define a route for the authorization flow
app.get('/authorize', (req, res) => {
    // Retrieve the redirect URI query parameter from the request
    hostname = req.query.hostnamen
    chanelId = req.query.channelname

    // check if channel is already in the database
    if (!checkChannel(channelId)) {
        // Redirect the user to the Nightbot site for authorization
        res.redirect(302, `https://nightbot.tv/oauth2/authorize?client_id=${process.env.NB_CLIENT_ID}&redirect_uri=${hostname}/authcallback&response_type=code&scope=commands`); 
    }
})

// Define a route for the revoke authorization flow
app.get('/revoke', (req, res) => {
    // Retrieve the redirect URI query parameter from the request
    hostname = req.query.hostname
    chanelId = req.query.channelname

    // check if channel exists in the db
    if (checkChannel(channelId)) {
        // get access token associated with channel in db
        const accessToken = getAccessToken(channelId)
    
        // send access token to nightbot to be revoked
        fetch(`https://api.nightbot.tv/oauth2/token/revoke?token=${accessToken}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
        })
        .catch(error => {
            console.error(error)
        })
        
        // remove the channel document from the db
        removeChannel(channelId)
    }
})

// Define a route to handle the authorization callback
app.get('/authcallback', (req, res) => {
    // Get the authorization code from the query parameters
    const code = req.query.code

    // Exchange the code for a user access token and add it to the database
    fetch(`https://api.nightbot.tv/oauth2/token?client_id=${process.env.NB_CLIENT_ID}&client_secret=${process.env.NB_CLIENT_SECRET}&code=${code}&grant_type=authorization_code&redirect_uri=${hostname}/config.html`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // data is the nightbot Bearer object
        let now = new Date()
        
        // create a json object that'll be stored as document in the db
        const doc = {
            channelName: channelId,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresOn: now.setDate(now.getDate() + 30)
        }

        // add the document to the database
        createChannel(doc)
    })
    .catch(error => {
        console.error(error)
    })

    // Redirect the user back to config.html | may be redundant if api call will redirect
    // res.redirect(`${hostname}/config.html`);
})

app.get('/commands', (req, res) => {
    hostname = req.query.hostname
    channelId = req.query.channelname

    // get access token associated with channel in db
    const accessToken = getAccessToken(channelId)

    // fetch commands from nightbot api
    fetch(`https://api.nightbot.tv/1/commands?access_token=${accessToken}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // send the commands array back to the ui
        res.send(data.commands)
    })
    .catch(error => {
        console.error(error)
    })
})
  
// Start the server
app.listen(8080, () => {
    console.log('Server started on port 8080')
})