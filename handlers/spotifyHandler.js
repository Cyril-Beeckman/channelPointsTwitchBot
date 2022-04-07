import axios from "axios"
import * as baseFunctions from "../baseFunctions.js"

export let refreshToken = async () => {
    return new Promise(resolve => {
        let params = baseFunctions.constructParams({
            grant_type: "refresh_token",
            refresh_token: credentials.spotify.refreshToken
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
            resolve(response.data.access_token)
        }).catch(error => console.log(error))
    });
}

/**
 * 
 * @param {string} title - title of track 
 * @returns {Object} Infos of the track
 */
export let searchTrack = async (title) => {
    return new Promise((resolve, reject) => {
        let spotifyAPI = baseFunctions.constructURL("https://api.spotify.com/v1/search", {
            type: "track",
            limit: 1,
            q: title.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        })

        axios.get(spotifyAPI, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${credentials.spotify.bearerToken}`
            }
        }).then(response => {
            let tracks = response.data.tracks.items
            if (tracks.length > 0) {
                resolve(tracks[0])
            } else {
                reject("NoMusic")
            }
        }).catch(error => reject(error))
    });
}

/**
 * 
 * @param {string} trackId - Id of the track from Spotify 
 */
export let addTrackToQueue = async (trackId) => {
    return new Promise((resolve, reject) => {
        let spotifyAPI = baseFunctions.constructURL("https://api.spotify.com/v1/me/player/queue", {
            uri: `spotify:track:${trackId}`
        })

        axios.post(spotifyAPI, {}, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${credentials.spotify.bearerToken}`
            }
        }).then(() => {
            resolve()
        }).catch(error => reject(error))
    })
}