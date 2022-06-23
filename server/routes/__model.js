class Route {
	app;
	db;

	method = 'get';
	path = '/';

	constructor(app, db, data) {
		this.app = app;
		this.db = db;
		for(var k in data) this[k] = data[k];
	}

	func(req, res) {
		return;
	}
}

module.exports = { Route };