const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'put',
			path: '/flags'
		})
	}

	async func(req, res) {
		if(!req.authed) return res.status(401).send();

		var flag = await this.db.flags.create(req.body);

		return res.status(200).send(flag);
	}
}

module.exports = (app, db) => new NewRoute(app, db);