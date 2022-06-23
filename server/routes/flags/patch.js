const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'patch',
			path: '/flags/:id'
		})
	}

	async func(req, res) {
		if(!req.authed) return res.status(401).send();

		var flag = await this.db.flags.get(req.params.id);
		if(!flag) return res.status(404).send();

		var body = req.body;
		for(var k in body) flag[k] = body[k];
		await flag.save();

		return res.status(200).send(flag);
	}
}

module.exports = (app, db) => new NewRoute(app, db);