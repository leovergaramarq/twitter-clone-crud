const mongoose = require('mongoose');

const { MONGODB_URI, MONGO_USER: MONGO_USERNAME, MONGO_PASSWORD } = require('./config');

const options = {
	useNewUrlParser: true,
	// useUnifiedTopology: true,
	user: MONGO_USERNAME,
	pass: MONGO_PASSWORD,
};

(async () => {
	try {
		const db = await mongoose.connect(MONGODB_URI, options);
		console.log(`Conection to database ${db.connection.name} successful`)

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
