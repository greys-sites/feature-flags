const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'delete',
			path: '/flags'
		})
	}

	async func(req, res) {
		if(!req.authed) return;

		await this.db.flags.deleteAll();
		return res.status(200).send();
	}
}

module.exports = (app, db) => new NewRoute(app, db);