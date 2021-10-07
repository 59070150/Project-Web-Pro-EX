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
		if (req.session.semeterId) {
			connection.query('SELECT * FROM section WHERE semeter_id = ?', [req.session.semeterId], function(error, results3, fields) {
				if (error) throw error;
				if (results3.length > 0) {
					connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
						if (error) throw error;
						if (results4.length > 0) {
							res.render('givescore', {userData: [], questionData: [], sectionData: results3, weekData: results4, scoreData: []});
						} else {
							res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เหลือ');
						}
					});
				} else {
					res.send('ยังไม่มีข้อมูลในเทอมที่เหลือ');
				}
			});
		} else {
			res.redirect('/semeter');
		}
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/givescore', (req, res) => {
	let week = req.body.week;
	let section = req.body.section;
	if (req.session.semeterId && week && section) {
		connection.query('SELECT * FROM student WHERE semeter_id = ? AND section_id = ?', [req.session.semeterId, section], function(error, results1, fields) {
			if (error) throw error;
			if (results1.length > 0) {
				connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results2, fields) {
					if (error) throw error;
					if (results2.length > 0) {
						connection.query('SELECT * FROM section WHERE semeter_id = ?', [req.session.semeterId], function(error, results3, fields) {
							if (error) throw error;
							if (results3.length > 0) {
								connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
									if (error) throw error;
									if (results4.length > 0) {
										connection.query('SELECT * FROM score WHERE exercise_id = ?', [week], function(error, results5, fields) {
											if (error) throw error;
											if (results5.length > 0) {
												res.render('givescore', {userData: results1, questionData: results2, sectionData: results3, weekData: results4, scoreData: results5});
											} else {
												res.render('givescore', {userData: results1, questionData: results2, sectionData: results3, weekData: results4, scoreData: []});
											}
										});
									} else {
										res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เหลือ');
									}
								});
							} else {
								res.send('ยังไม่มีข้อมูลในเทอมที่เหลือ');
							}
						});
					} else {
						res.send('ยังไม่มีข้อมูลแบบฝึกหัดในสัปดาห์ที่เลือก!!!');
					}
				});
			} else {
				res.send('ยังไม่มีข้อมูลนักเรียนในเซคที่เลือก!!!');
			}
		});
	} else {
		res.redirect('/semeter');
	}
})

router.get('/givepage/:studentId/:week', (req, res) => {
	if (req.session.loggedin == true) {
		const { studentId, week } = req.params;
		connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results1, fields) {
			if (error) throw error;
			res.render('givepage', {studentId: studentId, questionData: results1, weekData: week});
		})
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/givepage/:studentId/:week', (req, res) => {
	const { studentId, week } = req.params;
	let score = req.body.score;
	let tacomment = req.body.taComment;
	let inscomment = req.body.insComment;
	if (inscomment) {
		
	}
})

exports.router = router;