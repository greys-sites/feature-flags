const { Route } = require('./__model');

class NewRoute extends Route {
	constructor(app, db) {
		super(app, db, {
			method: 'get',
			path: '/flags'
		})
	}

	async func(req, res) {
		var flags = await this.db.flags.getAll();
		if(flags) {
			var data = {};
			for(var flag in flags) data[flag.name] = flag;
			return res.status(200).send(data);
		} else {
			return res.status(200).send({});
		}
	}
}

module.exports = (app, db) => new NewRoute(app, db);