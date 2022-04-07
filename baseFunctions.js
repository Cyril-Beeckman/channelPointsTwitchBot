/**
 * 
 * @param {string} url - Base url
 * @param {Object} params - List of params and values
 * @returns {string} - Encoded url with all params
 */
export let constructURL = (url, params) => {
    let newURL = new URL(url)
    for (let key in params) {
        newURL.searchParams.set(key, params[key])
    }

    return String(newURL)
}

/**
 * 
 * @param {Object} params - List of params and values
 * @returns {string} - Encoded string with all params
 */
export let constructParams = (params) => {
    let newParams = []
    for (let key in params) {
        newParams.push(`${key}=${params[key]}`)
    }

    return String(newParams.join("&"))
}