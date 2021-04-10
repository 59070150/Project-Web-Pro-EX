const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/classWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
  		res.render('classWeek', {week: week});
	} else {
	  res.send('Please login to view this page!');
  }
})

router.get('/editClass/:week', (req, res) => {
    const { week } = req.params;
    if (req.session.loggedin == true) {
        res.render('editClass', {week: week});
      } else {
        res.send('Please login to view this page!');
      }
  })

exports.router = router;