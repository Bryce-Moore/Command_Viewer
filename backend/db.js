import { MongoClient, ServerApiVersion } from 'mongodb'
const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })

// create channel document in the db
export default function createChannel(channelDoc) {
    client.connect(err => {
        const collection = client.db("Command_Viewer").collection("Channels");
        
        // add a document to the db
        collection.insertOne({
            "channel_name": channelDoc.channelName, 
            "access_token": channelDoc.accessToken,
            "refresh_token": channelDoc.refreshToken,
            "expires_on": channelDoc.expiresOn
        }, function(err, res) {
            console.log(err)
        })
    
        client.close();
    });
}

// fetch access token
export default function getAccessToken(channelName) {
    client.connect(err => {
        const collection = client.db("Command_Viewer").collection("Channels");
        let accessToken = ''
        let refreshToken = ''
        let expiresOn = new Date()
        
        // fetch document from db where channel_name == channelName
        collection.findOne({channel_name: channelName}, function(err, res) {
            accessToken = res.access_token
            refreshToken = res.refresh_token
            expiresOn.setDate(res.expires_on.toDate())
            console.log(err)
        })
        
        // check if access token has expired
        if (expiresOn < new Date()) {
            // Exchange the code for a user access token and add it to the database
            fetch(`https://api.nightbot.tv/oauth2/token?client_id=${process.env.NB_CLIENT_ID}&client_secret=${process.env.NB_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${hostname}/config.html&refresh_token=${refreshToken}`, {
                method: 'GET',
                headers: {
                'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                // data is the nightbot Bearer object
                let now = new Date();

                accessToken = data.access_token

                collection.updateOne({channel_name: channelName}, { $set: {
                    "access_token": data.access_token,
                    "refresh_token": data.refresh_token,
                    "expires_on": now.setDate(now.getDate() + 30)
                }})
            })
            .catch(error => {
                console.error(error)
            })
        }

        client.close();

        return accessToken
    });
}

// delete a document by channel name
export default function removeChannel(channelName) {
    client.connect(err => {
        const collection = client.db("Command_Viewer").collection("Channels");
        
        // add a document to the db
        collection.deleteOne({"channel_name": channelName})
    
        client.close();
    });
}

export default function checkChannel(channelName) {
    client.connect(err => {
        const collection = client.db("Command_Viewer").collection("Channels");

        collection.findOne({channel_name: channelDoc.channelName}, function(err, res) {
            if (res) {
                console.log(`Checked for ${channelName} in db. It already exists`)
                return true
            }
            else {
                console.log(`Checked for ${channelName} in db. Didn't exist`)
                return false
            }
        })
    })
}