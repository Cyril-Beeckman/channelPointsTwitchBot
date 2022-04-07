import * as spotifyHandler from "../handlers/spotifyHandler.js"
import * as twitchHandler from "../handlers/twitchHandler.js"

/**
 * 
 * @param {string} channel - Twitch channel
 * @param {string} username - Username of the user
 * @param {string} rewardId - Id of the Twitch Reward
 * @param {string} message - Title of the music
 */
export let addMusicToQueue = async (channel, username, rewardId, message, broadcasterId) => {
    credentials.spotify.bearerToken = await spotifyHandler.refreshToken()
    credentials.twitch.bearerToken = await twitchHandler.refreshToken()

    spotifyHandler.searchTrack(message).then(track => {
        spotifyHandler.addTrackToQueue(track.id).then(() => {
            twitchHandler.completeRedeem("FULFILLED", rewardId, username, broadcasterId).then(() => {
                let artists = track.artists.map(artist => artist.name).join(', ')
                twitchClient.say(channel, `@${username}, musique ajoutée ! ${artists} - ${track.name}`)
            }).catch(error => {
                console.log("Erreur pour accepter le point de chaine car succès de l'ajout de la musique")
            })

        }).catch(() => {
            twitchHandler.completeRedeem("CANCELED", rewardId, username, broadcasterId).then(() => {
                twitchClient.say(channel, `@${username}, un problème est survenu auprès de Spotify lors de l'ajout à la liste d'attente, tu as été remboursé !`)
            }).catch(error => {
                console.log("Erreur pour cancel le point de chaine car spotify n'as pas pu ajouter la musique à la file d'attente")
            })
        })
    }).catch((error) => {
        twitchHandler.completeRedeem("CANCELED", rewardId, username, broadcasterId).then(() => {
            if (error === "NoMusic") {
                twitchClient.say(channel, `@${username}, musique introuvable, tu as été remboursé !`)
            } else {
                twitchClient.say(channel, `@${username}, un problème est survenu auprès de Spotify lors de la recherche, tu as été remboursé !`)
            }
        }).catch(error => {
            if (error === "NoMusic") {
                console.log("Erreur pour cancel le point de chaine car aucune musique n'as été trouvé")
            } else {
                console.log("Erreur pour cancel le point de chaine car spotify a renvoyé une erreur lors de la recherche")
            }
        })
    })
}