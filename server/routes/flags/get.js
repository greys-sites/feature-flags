const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'get',
			path: '/flags/:id'
		})
	}

	async func(req, res) {
		var id = req.params.id;
		var flag = await this.db.flags.get(id);
		if(flag)
			return res.status(200).send(flag);
		else
			return res.status(404).send();
	}
}

module.exports = (app, db) => new NewRoute(app, db);