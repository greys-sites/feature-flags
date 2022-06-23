const { Pool } = require('pg');

module.exports = async () => {
	const db = new Pool();

	await db.query(`
		CREATE OR REPLACE FUNCTION gen_hid() RETURNS TEXT AS
			'select lower(substr(md5(random()::text), 0, 5));'
		LANGUAGE SQL VOLATILE;
		
		CREATE OR REPLACE FUNCTION find_unique(_tbl regclass) RETURNS TEXT AS $$
			DECLARE nhid TEXT;
			DECLARE res BOOL;
			BEGIN
				LOOP
					nhid := gen_hid();
					EXECUTE format(
						'SELECT (EXISTS (
							SELECT FROM %s
							WHERE hid = %L
						))::bool',
						_tbl, nhid
					) INTO res;
					IF NOT res THEN RETURN nhid; END IF;
				END LOOP;
			END
		$$ LANGUAGE PLPGSQL VOLATILE;
	`)

	var files = fs.readdirSync(__dirname);
	for(var file of files) {
		if(!file.endsWith('.js') || ['index.js'].includes(file)) continue;
		var name = file.replace(/\.js/i, "");
		db[name] = require(path+'/'+file)(db);
		if(db[name].init) db[name].init();
	}

	return db;
}