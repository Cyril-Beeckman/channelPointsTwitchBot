import axios from "axios"
import express from "express"
import path from "path"
const app = express()
const port = 3000
import admin from "firebase-admin"
import { connectToTmi } from "./handlers/tmiJsHandler.js"
import { addMusicToQueue } from "./channelPoints/chooseMusic.js"
import * as twitchHandler from "./handlers/twitchHandler.js"
import * as baseFunctions from "./baseFunctions.js"

connectToTmi(process.env.TWITCH_BOT_TOKEN, process.env.TWITCH_BOT_USERNAME, process.env.TWITCH_CHANNEL)
admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_CERT)),
    databaseURL: process.env.FIREBASE_URL
})

global.credentials = {}
global.db = admin.database()

db.ref('/credentials').once('value', async (snapshot) => {
    snapshot.forEach((data) => {
        credentials[data.key] = data.val()
    })
})

app.use(async (req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*')
    res.header("Access-Control-Allow-Credentials", true)
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json')
    next()
})

app.get('/', (req, res) => {
    db.ref('/last_events').once('value', (snapshot) => {
        let dataToSend = {}
        snapshot.forEach((data) => {
            dataToSend[data.key] = data.val()
        })

        axios.get(`https://wapi.wizebot.tv/api/channels/${process.env.WIZEBOT_API}/datas`, {}).then((response) => {
            dataToSend.subpoints = response.data.data.sub_total_points
            res.send(dataToSend)
        }).catch(console.error)
    })
})

app.get('/gettingstarted', (req, res) => {
    res.sendFile(path.join(path.resolve(), '/gettingstarted.html'));
})

app.get('/generate/:type/:type2?', async (req, res) => {
    let type = req.params.type.toLowerCase()
    if (!["spotify", "twitch"].includes(type)) return res.sendStatus(404)

    if (type === "twitch") {
        let type2 = req.params.type2
        if (type2) {
            if (type2.toLowerCase() !== "reward") return res.sendStatus(404)

            let endpoint = baseFunctions.constructURL("https://api.twitch.tv/helix/users", {
                login: process.env.TWITCH_CHANNEL
            })

            credentials.twitch.bearerToken = await twitchHandler.refreshToken()

            axios.get(endpoint, {
                headers: {
                    "Authorization": `Bearer ${credentials.twitch.bearerToken}`,
                    "Client-Id": credentials.twitch.clientId
                }
            }).then(response => {
                let broadcasterId = response.data.data[0].id

                endpoint = baseFunctions.constructURL("https://api.twitch.tv/helix/channel_points/custom_rewards", {
                    broadcaster_id: broadcasterId
                })

                axios.post(endpoint, {
                    title: "Your new channel point reward",
                    cost: 99999
                }, {
                    headers: {
                        "Authorization": `Bearer ${credentials.twitch.bearerToken}`,
                        "Client-Id": credentials.twitch.clientId
                    }
                }).then(response => {
                    res.sendFile(path.join(path.resolve(), '/success.html'));
                }).catch(error => console.log(error))

            }).catch(error => console.log(error))
        } else {
            let oauthUrl = baseFunctions.constructURL("https://id.twitch.tv/oauth2/authorize", {
                client_id: credentials.twitch.clientId,
                redirect_uri: `${req.protocol}://${req.get('host')}/callback`,
                response_type: "code",
                scope: "channel:manage:redemptions"
            })

            res.redirect(oauthUrl)
        }

    }

    if (type === "spotify") {
        let oauthUrl = baseFunctions.constructURL("https://accounts.spotify.com/authorize", {
            response_type: 'code',
            client_id: credentials.spotify.clientId,
            scope: "user-modify-playback-state",
            redirect_uri: `${req.protocol}://${req.get('host')}/callback`
        })
        res.redirect(oauthUrl)
    }
})

app.get('/callback', (req, res) => {
    if (!req.query.code) return res.sendStatus(404)

    if (req.query.scope) {
        let oauthUrl = baseFunctions.constructURL("https://id.twitch.tv/oauth2/token", {
            client_id: credentials.twitch.clientId,
            client_secret: credentials.twitch.clientSecret,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: `${req.protocol}://${req.get('host')}/callback`
        })

        axios.post(oauthUrl)
            .then(response => {
                db.ref(`/credentials/twitch/refreshToken`).set(response.data.refresh_token)
                res.sendFile(path.join(path.resolve(), '/success.html'));
            }).catch(error => console.log(error))
    } else {
        let params = baseFunctions.constructParams({
            code: req.query.code,
            redirect_uri: `${req.protocol}://${req.get('host')}/callback`,
            grant_type: "authorization_code"
        })

        axios.post("https://accounts.spotify.com/api/token", params, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            auth: {
                username: credentials.spotify.clientId,
                password: credentials.spotify.clientSecret
            }
        }).then(response => {
            db.ref(`/credentials/twitch/refreshToken`).set(response.data.refresh_token)
            res.sendFile(path.join(path.resolve(), '/success.html'));
        }).catch(error => console.log(error))
    }
})

app.listen(port, () => {
    console.log(`Listening...`)
})

twitchClient.on('redeem', async (channel, username, rewardType, tags, message) => {
    switch (rewardType) {
        case "2159887b-21fd-48c5-8db1-f508a8c356a8": // Choisit la musique
            addMusicToQueue(channel, username, rewardType, message, tags["room-id"])
            break
    }
})