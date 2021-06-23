const mysql = require("mysql");

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345678',
	database : 'semeter_db',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000
	  }
});

module.exports = connection;