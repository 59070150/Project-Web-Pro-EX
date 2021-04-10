const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/exWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
  		res.render('exWeek', {week: week});
	} else {
	  res.send('Please login to view this page!');
  }
})

router.get('/editEx/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
  		res.render('editEx', {week: week});
	} else {
	  res.send('Please login to view this page!');
  }
})

exports.router = router;