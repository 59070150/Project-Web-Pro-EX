const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/progress', (req, res) => {
	if (req.session.loggedin == true) {
  		res.render('progress');
	} else {
	  res.send('Please login to view this page!');
  }
})

router.get('/givescore', (req, res) => {
	if (req.session.loggedin == true) {
		res.render('givescore', {userData: []});
	} else {
		res.send('Please login to view this page!');
	}
})

router.get('/givepage', (req, res) => {
	if (req.session.loggedin == true) {
		res.render('givepage', {userData: []});
	} else {
		res.send('Please login to view this page!');
	}
})

exports.router = router;