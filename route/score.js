const express = require("express");
const connection = require("../config");
const csv = require("fast-csv");
const fs = require("fs");
const ws = fs.createWriteStream("web_pro_ex_score.csv");

router = express.Router();

router.get('/progress', (req, res) => {
	if (req.session.loggedin == true) {
		if (req.session.semeterId) {
			connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
				if (error) throw error;
				if (results4.length > 0) {
					res.render('progress', {weekData: results4, scoreData: [], quesData: [], week: []});
				} else {
					res.send('ยังไม่มีข้อมูลในภาคการศึกษาที่เหลือ');
				}
			});
		} else {
			res.redirect('/semeter');
		}
	} else {
	  res.send('Please login to view this page!');
  }
})

router.post('/progress', (req, res) => {
	let week = req.body.week;
	if (week) {
		connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results1, fields) {
			if (error) throw error;
			if (results1.length > 0) {
				connection.query('SELECT * FROM score WHERE exercise_id = ?', [week], function(error, results2, fields) {
					if (error) throw error;
					if (results2.length > 0) {
						connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
							if (error) throw error;
							if (results4.length > 0) {
								res.render('progress', {weekData: results4, scoreData: results2, quesData: results1, week: week});
							} else {
								res.send('ยังไม่มีข้อมูลในภาคการศึกษาที่เหลือ');
							}
						});
					} else {
						res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เลือก');
					}
				})
			} else {
				res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เลือก');
			}
		})
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
	if (score && inscomment) {
		connection.query('SELECT * FROM admin WHERE username = ?', [req.session.username], function(error, results1, fields) {
			if (error) throw error;
			let userId = results1[0].user_id;
			connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results2, fields) {
				if (error) throw error;
				connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ?', [studentId, week], function(error, results3, fields) {
					if (error) throw error;
					if (results3.length > 0) {
						let point = [];
						let stack = [];
						for (let i = 0; i < score.length; i++) {
							if (score[i] != '' && inscomment[i] != '') {
								connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ? AND question_id = ?', [studentId, week, results2[i].question_id], function(error, resultsC, fields) {
									if (error) throw error;
									if (resultsC.length > 0) {
										connection.query('UPDATE score SET score = ?, instructor_comment = ?, update_date = CURRENT_TIMESTAMP, instructor_comment_by = ?, update_by = ? WHERE student_id = ? AND question_id = ?', [score[i], inscomment[i], userId, userId, studentId, results2[i].question_id], function(error, results, fields) {
											if (error) throw error;
										})
									} else {
										point.push(score[i], inscomment[i], studentId, week, results2[i].question_id, userId, userId);
										stack.push(point);
										point = [];
										connection.query('INSERT INTO score (`score`, `instructor_comment`, `student_id`, `exercise_id`, `question_id`, `instructor_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
											if (error) throw error;
										})
										stack = [];
									}
								})
							} else if (score[i] != '' && inscomment[i] == '') {
								connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ? AND question_id = ?', [studentId, week, results2[i].question_id], function(error, resultsC, fields) {
									if (error) throw error;
									if (resultsC.length > 0) {
										connection.query('UPDATE score SET score = ?, update_date = CURRENT_TIMESTAMP, instructor_comment_by = ?, update_by = ? WHERE student_id = ? AND question_id = ?', [score[i], userId, userId, studentId, results2[i].question_id], function(error, results, fields) {
											if (error) throw error;
										})
									} else {
										point.push(score[i], studentId, week, results2[i].question_id, userId, userId);
										stack.push(point);
										point = [];
										connection.query('INSERT INTO score (`score`, `student_id`, `exercise_id`, `question_id`, `instructor_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
											if (error) throw error;
										})
										stack = [];
									}
								})
							} else {
								console.log('Blank Data!!');
							}
						}
						res.redirect('/givescore');
					} else {
						let point = [];
						let stack = [];
						for (let i = 0; i < score.length; i++) {
							if (score[i] != '') {
								point.push(score[i], inscomment[i], studentId, week, results2[i].question_id, userId, userId);
								stack.push(point);
								point = [];
							} else {
								point = [];
							}
						}
						connection.query('INSERT INTO score (`score`, `instructor_comment`, `student_id`, `exercise_id`, `question_id`, `instructor_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
							if (error) throw error;
							res.redirect('/givescore');
						})
					}
				})
			})
		});
	} else if (score && tacomment) {
		connection.query('SELECT * FROM admin WHERE username = ?', [req.session.username], function(error, results1, fields) {
			if (error) throw error;
			let userId = results1[0].user_id;
			connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results2, fields) {
				if (error) throw error;
				connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ?', [studentId, week], function(error, results3, fields) {
					if (error) throw error;
					if (results3.length > 0) {
						let point = [];
						let stack = [];
						for (let i = 0; i < score.length; i++) {
							if (score[i] != '' && tacomment[i] != '') {
								connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ? AND question_id = ?', [studentId, week, results2[i].question_id], function(error, resultsC, fields) {
									if (error) throw error;
									if (resultsC.length > 0) {
										connection.query('UPDATE score SET score = ?, TA_comment = ?, update_date = CURRENT_TIMESTAMP, TA_comment_by = ?, update_by = ? WHERE student_id = ? AND question_id = ?', [score[i], tacomment[i], userId, userId, studentId, results2[i].question_id], function(error, results, fields) {
											if (error) throw error;
										})
									} else {
										point.push(score[i], tacomment[i], studentId, week, results2[i].question_id, userId, userId);
										stack.push(point);
										point = [];
										connection.query('INSERT INTO score (`score`, `TA_comment`, `student_id`, `exercise_id`, `question_id`, `TA_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
											if (error) throw error;
										})
										stack = [];
									}
								})
							} else if (score[i] != '' && tacomment[i] == '') {
								connection.query('SELECT * FROM score WHERE student_id = ? AND exercise_id = ? AND question_id = ?', [studentId, week, results2[i].question_id], function(error, resultsC, fields) {
									if (error) throw error;
									if (resultsC.length > 0) {
										connection.query('UPDATE score SET score = ?, update_date = CURRENT_TIMESTAMP, TA_comment_by = ?, update_by = ? WHERE student_id = ? AND question_id = ?', [score[i], userId, userId, studentId, results2[i].question_id], function(error, results, fields) {
											if (error) throw error;
										})
									} else {
										point.push(score[i], studentId, week, results2[i].question_id, userId, userId);
										stack.push(point);
										point = [];
										connection.query('INSERT INTO score (`score`, `student_id`, `exercise_id`, `question_id`, `TA_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
											if (error) throw error;
										})
										stack = [];
									}
								})
							} else {
								console.log('Blank Data!!');
							}
						}
						res.redirect('/givescore');
					} else {
						let point = [];
						let stack = [];
						for (let i = 0; i < score.length; i++) {
							if (score[i] != '') {
								point.push(score[i], tacomment[i], studentId, week, results2[i].question_id, userId, userId);
								stack.push(point);
								point = [];
							} else {
								point = [];
							}
						}
						connection.query('INSERT INTO score (`score`, `TA_comment`, `student_id`, `exercise_id`, `question_id`, `TA_comment_by`, `created_by`) VALUES ?', [stack], function(error, results4, fields) {
							if (error) throw error;
							res.redirect('/givescore');
						})
					}
				})
			})
		});
	} else {
		res.send('Please insert score and comment!!!');
	}
})

router.get('/export/:week', (req, res) => {
	const { week } = req.params;
	const directoryPath = '.' + '/';
	let name = "web_pro_ex_score.csv";
	connection.query("SELECT * FROM score WHERE exercise_id = ?", [week], function(error, data, fields) {
		if (error) throw error;
	
		const jsonData = JSON.parse(JSON.stringify(data));
	
		csv
		  .write(jsonData, { headers: true })
		  .on("finish", function() {
			console.log("Write to web_pro_ex_score.csv successfully!");
			res.download(directoryPath + name, name, (err) => {
				if (err) {
				  res.status(500).send({
					message: "Could not download the file. " + err,
				  });
				}
			});
		  })
		  .pipe(ws);
	  });
})

router.get('/exportall', (req, res) => {
	const directoryPath = '.' + '/';
	let name = "web_pro_ex_score.csv";
	connection.query("SELECT * FROM score", function(error, data, fields) {
		if (error) throw error;
	
		const jsonData = JSON.parse(JSON.stringify(data));
		// console.log("jsonData", jsonData);
	
		csv
		  .write(jsonData, { headers: true })
		  .on("finish", function() {
			console.log("Write to web_pro_ex_score.csv successfully!");
			res.download(directoryPath + name, name, (err) => {
				if (err) {
				  res.status(500).send({
					message: "Could not download the file. " + err,
				  });
				}
			});
		  })
		  .pipe(ws);
	  });
})

exports.router = router;