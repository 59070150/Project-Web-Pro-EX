const mysql = require("mysql");

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345678',
	database : 'semeter_db'
});

module.exports = connection;