const express = require('express')
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const mysql = require("mysql");

const app = express()
const port = 3000

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '12345678',
	database : 'register_db'
});

app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/img'));
app.use(express.static(__dirname + 'views'));
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) => {
  res.render('login')
})

app.get('/login', (req, res) => {
	res.render('login')
})

app.get('/logout', (req, res) => {
	req.session.destroy();
  res.redirect('/login')
})

app.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.userlevel = results[0].userlevel;
				if(req.session.loggedin == true){
					res.render('home', {username: req.session.username, userlevel: req.session.userlevel});
				} else {
					res.send('Please login to view this page!');
				}
			} else {
				var msg = "Incorrect Username and/or Password!";
				res.render('login', {alertMsg: msg});
			}
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

app.get('/home', (req, res) => {
  if (req.session.loggedin == true) {
	  const username = req.session.username;
	  const userlevel = req.session.userlevel;
	  res.render('home', {username: username, userlevel: userlevel});
  } else {
	res.send('Please login to view this page!');
}
	res.end();
})

app.get('/progress', (req, res) => {
	if (req.session.loggedin == true) {
		const username = req.session.username;
		const userlevel = req.session.userlevel;
  		res.render('progress', {username: username, userlevel: userlevel});
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.get('/semeter', (req, res) => {
	if (req.session.loggedin == true) {
		const username = req.session.username;
		const userlevel = req.session.userlevel;
		res.render('semeter', {username: username, userlevel: userlevel})
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.get('/register', (req, res) => {
	if (req.session.loggedin == true) {
		const username = req.session.username;
		const userlevel = req.session.userlevel;
		res.render('register', {username: username, userlevel: userlevel})
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let userlevel = "admin";
	connection.query('SELECT * FROM user WHERE username = ? OR password = ?', [username, password], function(error, results, fields) {
		if (results.length > 0) {
			if (error) throw error;
			var msg = "This user already exist!!!";
		} else {
			connection.query('INSERT INTO user (`username`, `password`, `userlevel`) VALUES (?, ?, ?)', [username, password, userlevel], function(error, results, fields) {
				if (error) {
					var msg = "Registeration Fail!!!";
				}
			});
			var msg = "Registeration Successful!!!";
		}
		res.render('register', {username: req.session.username, userlevel: req.session.userlevel, alertMsg: msg});
	});
})

app.get('/classWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
		const username = req.session.username;
		const userlevel = req.session.userlevel;
  		res.render('classWeek', {week: week, username: username, userlevel: userlevel});
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.get('/exWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
		const username = req.session.username;
		const userlevel = req.session.userlevel;
  		res.render('exWeek', {week: week, username: username, userlevel: userlevel});
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.get('/editClass/:week', (req, res) => {
  const { week } = req.params;
  if (req.session.loggedin == true) {
		const username = req.session.username;
	  	res.render('editClass', {week: week, username: username});
	} else {
  		res.send('Please login to view this page!');
	}
  		res.end();
})

app.get('/editEx/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
		const username = req.session.username;
  		res.render('editEx', {week: week, username: username});
	} else {
	  res.send('Please login to view this page!');
  }
	  res.end();
})

app.get('/studentlist', (req, res, next) => {
	connection.query('SELECT * FROM user', function(error, results, fields) {
		if (error) throw error;
		res.render('studentlist', {username: req.session.username, userlevel: req.session.userlevel, userData: results});
	});
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})