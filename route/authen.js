const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/', (req, res) => {
    res.render('login')
})

router.get('/login', (req, res) => {
    res.render('login')
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
})

router.post('/login', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.isAdmin = results[0].is_admin;
				req.session.id = results[0].user_id;
				res.redirect('/home');
			} else {
				var msg = "Incorrect Username and/or Password!";
				res.render('login', {alertMsg: msg});
			}
		});
	} else {
		res.send('Please enter Username and Password!');
	}
});

router.get('/register', (req, res) => {
	if (req.session.loggedin == true) {
		res.render('register')
	} else {
	  res.send('Please login to view this page!');
  }
})

router.post('/register', (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let isAdmin = 1;
	connection.query('SELECT * FROM admin WHERE username = ? OR password = ?', [username, password], function(error, results, fields) {
		if (results.length > 0) {
			if (error) throw error;
			var msg = "This user already exist!!!";
		} else {
			connection.query('INSERT INTO admin (`username`, `password`, `is_admin`, `firstname`, `lastname`) VALUES (?, ?, ?, ?, ?)', [username, password, isAdmin, firstname, lastname], function(error, results, fields) {
				if (error) {
					var msg = "Registeration Fail!!!";
				}
			});
			var msg = "Registeration Successful!!!";
		}
		res.render('register', {alertMsg: msg});
	});
})

router.get('/studentlist', (req, res) => {
	if (req.session.loggedin == true) {
		res.render('studentlist', {userData: []});
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/studentlist', (req, res, next) => {
	let selectLevel = req.body.level;
	connection.query('SELECT * FROM user WHERE userlevel = ?', [selectLevel], function(error, results, fields) {
		if (error) throw error;
		res.render('studentlist', {userData: results});
	});
})

exports.router = router;