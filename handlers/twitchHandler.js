import axios from "axios"
import * as baseFunctions from "../baseFunctions.js"

export let refreshToken = async () => {
    return new Promise(resolve => {
        let twitchAPI = baseFunctions.constructURL("https://id.twitch.tv/oauth2/token", {
            grant_type: "refresh_token",
            refresh_token: credentials.twitch.refreshToken,
            client_id: credentials.twitch.clientId,
            client_secret: credentials.twitch.clientSecret
        })

        axios.post(twitchAPI)
            .then(response => {
                credentials.twitch.refreshToken = response.data.refresh_token
                db.ref(`/credentials/twitch/refreshToken`).set(response.data.refresh_token)
                resolve(response.data.access_token)
            }).catch(error => {
                console.log(error)
            })
    })
}

/**
 * 
 * @param {string} status - Status for the reedem (FULFILLED or CANCELED)
 * @param {string} rewardId - Id of the reward (Need to be created with same ClientId)
 * @param {string} userLogin - Username of the user
 */
export let completeRedeem = async (status, rewardId, userLogin, broadcasterId) => {
    return new Promise((resolve, reject) => {

        let twitchAPI = baseFunctions.constructURL("https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions", {
            broadcaster_id: broadcasterId,
            status: "UNFULFILLED",
            reward_id: rewardId,
            client_secret: credentials.twitch.clientSecret
        })

        axios.get(twitchAPI, {
            headers: {
                "Client-Id": credentials.twitch.clientId,
                "Authorization": `Bearer ${credentials.twitch.bearerToken}`
            }
        }).then(response => {
            response.data.data.forEach(redemption => {
                if (redemption.user_login == userLogin) {
                    twitchAPI = baseFunctions.constructURL("https://api.twitch.tv/helix/channel_points/custom_rewards/redemptions", {
                        broadcaster_id: broadcasterId,
                        id: redemption.id,
                        reward_id: rewardId,
                    })

                    axios.patch(twitchAPI, {
                        "status": status
                    }, {
                        headers: {
                            "Client-Id": credentials.twitch.clientId,
                            "Authorization": `Bearer ${credentials.twitch.bearerToken}`
                        }
                    }).then(() => {
                        resolve()
                    }).catch(error => {
                        console.log(error)
                        reject(error)
                    })
                }
            })
        }).catch(error => reject(error))
    })
}