const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const dbString = process.env.REMOTE_DATABASE_URL;

mongoose
	.connect(dbString, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	// eslint-disable-next-line no-unused-vars
	.then((conn) => {
		console.log('DB connected');
	})
	.catch((err) => console.log(err.message));

const app = require('./app');

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
	console.log(`App running on port ${port}...`);
});
