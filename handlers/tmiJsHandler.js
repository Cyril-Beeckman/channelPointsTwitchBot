import tmi from "tmi.js"

/**
 * 
 * @param {string} botToken - Token of chatbot
 * @param {string} botName - Username of chatbot
 * @param {string} channel - Channel to connect
 */
export let connectToTmi = async (botToken, botName, channel) => {
    global.twitchClient = new tmi.Client({
        identity: {
            username: botName,
            password: botToken
        },
        channels: [channel]
    });

    twitchClient.connect();
}