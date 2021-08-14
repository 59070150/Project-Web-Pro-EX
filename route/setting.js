const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/semeter', (req, res) => {
	if (req.session.loggedin == true) {
		connection.query('SELECT DISTINCT year FROM semeter', function(error, results, fields) {
			res.render('semeter', {userData: results});
		})
	} else {
	  res.send('Please login to view this page!');
  }
})

// router.post('/semeter', (req, res) => {
// 	let year = req.body.year;
// 	let semeter = req.body.semeter;
// 	connection.query('SELECT * FROM semeter WHERE year = ? AND semeter = ?', [year, semeter], function(error, results, fields) {
// 		if (error) {
// 			var msg = "Something Wrong!!!";
// 		} else {
// 			req.session.week = results[0].semeter_id;
// 			var msg = "Selected Complete!!!";
// 		}
// 		res.render('semeter', {username: req.session.username, userlevel: req.session.userlevel, alertMsg: msg});
// 	})
// })

exports.router = router;