const { config } = require('dotenv');

config();

module.exports = {
    MONGODB_URI: process.env.MONGO_URI || 'mongodb+srv://user:cgp1sSATEmnpcnnJ@cluster.oakrbnb.mongodb.net/twitter-clone-db?retryWrites=true&w=majority',
    PORT: process.env.PORT || 3000,
}
