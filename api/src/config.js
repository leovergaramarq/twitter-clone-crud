const { config } = require('dotenv');

config();

module.exports = {
    // MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/twitter-clone-db', // Local
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://db:27017/twitter-clone-db', // Docker
    MONGO_USER: process.env.MONGO_USERNAME || 'user',
    MONGO_PASSWORD: process.env.MONGO_PASSWORD || 'secret',
    PORT: process.env.PORT || 3000,
}
