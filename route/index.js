const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/home', (req, res) => {
    if (req.session.loggedin == true) {
        connection.query('SELECT * FROM news', function(error, results) {
          res.render('home', {newsData: results});
        })
    } else {
      res.send('Please login to view this page!');
  }
  })

exports.router = router;