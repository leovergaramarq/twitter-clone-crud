const mongoose = require('mongoose');

const { MONGODB_URI: MONGO_URI } = require('./config');

const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	// connectTimeoutMS: 10000,
};

console.log(MONGO_URI);

(async () => {
	try {
		const db = await mongoose.connect(MONGO_URI, options);
		console.log(`Connection to database ${db.connection.name} successful`)

		db.connection.on('error', err => {
			console.log(`Database connection error: ${err}`);
		});

		db.connection.on('disconnected', () => {
			console.log('Database disconnected');
		});
	} catch(err) {
		console.log('Couldn\'t connect to database', err);
	}
})();
