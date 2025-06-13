
const axios = require('axios')

const osmRouteApi = axios.create({
    baseURL: 'https://router.project-osrm.org/route/v1/driving'
})

module.exports = {
    osmRouteApi
}
