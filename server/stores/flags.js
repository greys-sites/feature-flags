const KEYS = {
	id: { },
	hid: { },
	name: { patch: true },
	enabled: { patch: true },
	enabled_for: { patch: true }
}

class Flag {
	#store;
	#keys;

	constructor(store, keys, data) {
		this.#store = store;
		this.#keys = keys;

		for(var k in keys)
			this[k] = data[k];
	}

	async fetch() {
		var data = await this.#store.getID(this.id);
		for(var k in this.KEYS)
			this[k] = data[k];

		return this;
	}

	async save() {
		var obj = await this.verify((this.id != null));

		var data;
		if(this.id) data = await this.#store.update(this.id, obj, this.old);
		else data = await this.#store.create(obj);
		for(var k in this.KEYS) this[k] = data[k];
		this.old = Object.assign({}, data);
		return this;
	}

	async delete() {
		await this.#store.delete(this.id);
	}

	async verify(patch = true) {
		var obj = {};
		var errors = []
		for(var k in this.KEYS) {
			if(!this.KEYS[k].patch && patch) continue;
			if(this[k] === undefined) continue;
			if(this[k] === null) {
				obj[k] = null;
				continue;
			}

			var test = true;
			if(this.KEYS[k].test) test = await this.KEYS[k].test(this[k]);
			if(!test) {
				errors.push(this.KEYS[k].err);
				continue;
			}
			if(this.KEYS[k].transform) obj[k] = this.KEYS[k].transform(this[k]);
			else obj[k] = this[k];
		}

		if(errors.length) throw new Error(errors.join("\n"));
		return obj;
	}
}

class FlagStore {
	#db;

	constructor(db) {
		this.#db = db;
	}

	init() {
		this.#db.query(`create table if not exists flags (
			id 			serial primary key,
			hid 		text,
			name 		text,
			enabled 	boolean,
			enabled_for int[]
		)`)
	}

	async create(data) {
		try {
			var c = await this.#db.query(`insert into flags (
				hid,
				name,
				enabled,
				enabled_for
			) values (find_unique('flags'), $1, $2, $3)
			RETURNING *`,
			[data.name, data.enabled ?? false, data.enabled_for ?? []])
		} catch(e) {
			return Promise.reject(e);
		}

		return new Flag(this, KEYS, data.rows[0]);
	}

	async get(hid) {
		try {
			var data = await this.#db.query(`select * from flags where hid = $1`, [hid]);
		} catch(e) {
			return Promise.reject(e);
		}

		if(data.rows?.[0]) return new Flag(this, KEYS, data.rows[0]);
		else return new Flag(this, KEYS, {});
	}

	async getId(id) {
		try {
			var data = await this.#db.query(`select * from flags where id = $1`, [id]);
		} catch(e) {
			return Promise.reject(e);
		}

		if(data.rows?.[0]) return new Flag(this, KEYS, data.rows[0]);
		else return new Flag(this, KEYS, {});
	}

	async update(id, data = {}) {
		try {
			await this.#db.query(`UPDATE flags SET ${Object.keys(data).map((k, i) => k+"=$"+(i+2)).join(",")} WHERE id = $1`,[id, ...Object.values(data)]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}

		return await this.getID(id);
	}

	async delete(id) {
		try {
			await this.#db.query(`DELETE FROM flags WHERE id = $1`, [id]);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async deleteAll() {
		try {
			await this.#db.query(`DELETE FROM flags`);
		} catch(e) {
			console.log(e);
			return Promise.reject(e.message);
		}
		
		return;
	}

	async enable(hid, pid) {
		var flag = await this.get(hid);
		if(!flag?.id) return Promise.reject('Flag not found.');

		var prog = await this.#db.programs.get(pid);
		if(!prog?.id) return Promise.reject('Program not found.');

		if(flag.enabled_for.includes(prog.id)) return;
		flag.enabled_for.push(prog.id);
		await flag.save();

		return;
	}

	async disable(hid, pid) {
		var flag = await this.get(hid);
		if(!flag?.id) return Promise.reject('Flag not found.');

		var prog = await this.#db.programs.get(pid);
		if(!prog?.id) return Promise.reject('Program not found.');

		if(!flag.enabled_for.includes(prog.id)) return;
		flag.enabled_for = flag.enabled_for.filter(x => x !== prog.id);
		await flag.save();

		return;
	}

	async getEnabled(pid) {
		var program = await this.#db.programs.get(pid);
		if(!prog?.id) return Promise.reject('Program not found.');

		var flags = await this.#db.query(`select * from flags where $1 = any(enabled_for)`, [prog.id]);
		if(!flags?.rows[0]) return undefined;
		else return flags.map(f => new Flag(this, KEYS, f));
	}
}