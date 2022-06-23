const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'patch',
			path: '/flags/:pid/disable/:fid'
		})
	}

	async func(req, res) {
		if(!req.authed) return res.status(401).send();

		await this.db.flags.disable(req.params.pid, req.params.fid);

		return res.status(200).send();
	}
}

module.exports = (app, db) => new NewRoute(app, db);