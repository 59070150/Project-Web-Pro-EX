const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/home', (req, res) => {
    if (req.session.loggedin == true) {
        connection.query('SELECT * FROM news', function(error, results, fields) {
          if (error) throw error
          connection.query('SELECT * FROM class_material', function(error, results1, fields) {
            if (error) throw error
            connection.query('SELECT * FROM exercise', function(error, results2, fields) {
              if (error) throw error
              res.render('home', {newsData: results, classData: results1, exData: results2});
            })
          })
        });
    } else {
      res.send('Please login to view this page!');
  }
  })

exports.router = router;