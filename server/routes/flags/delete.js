const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'delete',
			path: '/flags/:id'
		})
	}

	async func(req, res) {
		if(!req.authed) return res.status(401).send();

		await this.db.flags.delete(req.params.id);
		return res.status(200).send();
	}
}

module.exports = (app, db) => new NewRoute(app, db);