require('dotenv').config()
const express = require('express');

var app = express.app();

async function setup() {
	const database = await require('./database')(app);
	const routes = require('./routes')(app, db);
}

setup()
.then(() => app.listen(process.env.PORT ?? 8080))
.catch(console.error)