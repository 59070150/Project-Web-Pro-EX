const express = require("express");
const connection = require("../config");
const path = require("path");
const multer = require("multer");

router = express.Router();

const storage = multer.diskStorage({
	destination: function(req, file, callback) {
	  callback(null, './img');
	},
	filename: function(req, file, callback) {
	  callback(null, file.originalname);
	}
});

const upload = multer({ storage: storage })

router.get('/exWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
		connection.query('SELECT * FROM exercise WHERE exercise_id = ?', [week], function(error, results1, fields) {
			if (error) throw error;
			let description = results1[0].exercise_description;
			let exlink = results1[0].github_solution;
			let anslink = results1[0].github_answer;
			connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results2, fields) {
			  if (error) throw error;
			  connection.query('SELECT * FROM exercise_image WHERE exercise_id = ?', [week], function(error, results3, fields){
				if (error) throw error;
				res.render('exWeek', {week: week, desc: description, exlink: exlink, anslink: anslink, quesData: results2, imgData: results3});
			  });
			});
		  });
	} else {
	  res.send('Please login to view this page!');
  }
})

router.get('/editEx/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
		connection.query('SELECT * FROM exercise WHERE exercise_id = ?', [week], function(error, results1, fields) {
			if (error) throw error;
			let description = results1[0].exercise_description;
			let exlink = results1[0].github_solution;
			let anslink = results1[0].github_answer;
			connection.query('SELECT * FROM exercise_question WHERE exercise_id = ?', [week], function(error, results2, fields) {
				if (error) throw error;
				res.render('editEx', {week: week, desc: description, exlink: exlink, anslink: anslink, quesData: results2});
			})
		  });
	} else {
	  res.send('Please login to view this page!');
  }
})

router.post('/editEx/:week', upload.fields([{ name: 'exImage', maxCount: 5 }]), (req, res) => {
	const { week } = req.params;
	let exerciseId = parseInt(week);
	let exdescription = req.body.excomment;
	let file = req.files['exImage'];
	let exGitlink = req.body.exGitlink;
	let solGitlink = req.body.solGitlink;
	let gitdate = req.body.gitDate;
	let exTitle = req.body.extitle;
	let exDesc = req.body.exdesc;
	let exScore = req.body.exscore;
	let question = [];
	let stack = [];
	if (file) {
		connection.query('DELETE FROM exercise_image WHERE exercise_id = ?', [exerciseId], function(error, results, fields) {
			if (error) throw error;
		});
		let img = [];
		let stack2 = [];
		for (let j = 0; j < file.length; j++){
			img.push(file[j].filename, file[j].path, exerciseId);
			stack2.push(img);
			img = [];
		}
		connection.query('INSERT INTO exercise_image (`image_title`, `image_src`, `exercise_id`) VALUES ?', [stack2], function(error, results, fields) {
			if (error) throw error;
		});
	}
	for (let i = 0; i < exScore.length; i++){
		if (exTitle[i] != '' && exDesc[i] != '' && exScore[i] != ''){
		  question.push(exTitle[i], exDesc[i], exScore[i], exerciseId);
		  stack.push(question);
		  question = [];
		} else {
		  stack = [];
		}
	}
	if (stack != []) {
		connection.query('DELETE FROM exercise_question WHERE exercise_id = ?', [exerciseId], function(error, results, fields) {
			if (error) throw error;
		});
		connection.query('UPDATE exercise SET exercise_description = ?, github_solution = ?, github_answer = ?, github_date = ?, update_date = CURRENT_TIMESTAMP,  update_by = (SELECT user_id FROM admin WHERE username = ?) WHERE exercise_id = ?', [exdescription, exGitlink, solGitlink, gitdate, req.session.username, exerciseId], function(error, results, fields) {
			if (error) throw error;
			connection.query('INSERT INTO exercise_question (`question_title`, `question_description`, `question_score`, `exercise_id`) VALUES ?', [stack], function(error, results, fields) {
				if (error) throw error;
			});
		});
	} else {
		res.send("Please insert question data before submit!!!");
	}
	res.redirect('/home');
})

router.get('/addExercise', (req, res) => {
	if (req.session.loggedin == true) {
	  res.render('addExercise');
	} else {
	  res.send('Please login to view this page!');
	}
  })

router.post('/addExercise', upload.array('exImage'), (req, res) => {
	let week = req.body.week;
	let exerciseId = parseInt(week);
	let exerciseTitle = req.body.exerciseTitle;
	let exdescription = req.body.excomment;
	let files = req.files;
	let exGitlink = req.body.exGitlink;
	let solGitlink = req.body.solGitlink;
	let gitdate = req.body.gitDate;
	let exTitle = req.body.extitle;
	let exDesc = req.body.exdesc;
	let exScore = req.body.exscore;
	if (!exdescription || !exGitlink || !solGitlink || !exTitle || !exDesc || !exScore || !exerciseTitle) {
		res.send("Please insert completely data before submit!!!");
	} else if (!files) {
		res.send("Please upload image before submit!!!");
	} else {
		let question = [];
		let stack = [];
		for (let i = 0; i < exScore.length; i++){
			if (exTitle[i] != '' && exDesc[i] != '' && exScore[i] != ''){
			  question.push(exTitle[i], exDesc[i], exScore[i], exerciseId);
			  stack.push(question);
			  question = [];
			} else {
			  stack = [];
			}
		}
		let img = [];
		let stack2 = [];
		for (let j = 0; j < files.length; j++){
			img.push(files[j].filename, files[j].path, exerciseId);
			stack2.push(img);
			img = [];
		}
		if (stack != []) {
			connection.query('SELECT * FROM exercise WHERE exercise_id = ?', [exerciseId], function(error, resultsC, fields) {
				if (resultsC.length > 0) {
				  res.send('This week has data already');
				} else {
				  connection.query('INSERT INTO exercise (`exercise_id`, `exercise_title`, `exercise_description`, `github_exercise`, `github_solution`, `github_date`, `week_id`, `created_by`, `update_by`) VALUES (?, ?, ?, ?, ?, ?, (SELECT week_id FROM week WHERE week = ?), (SELECT user_id FROM admin WHERE username = ?), (SELECT user_id FROM admin WHERE username = ?))', [exerciseId, exerciseTitle, exdescription, exGitlink, solGitlink, gitdate, exerciseId, req.session.username, req.session.username], function(error, results, fields) {
					if (error) throw error;
					connection.query('INSERT INTO exercise_question (`question_title`, `question_description`, `question_score`, `exercise_id`) VALUES ?', [stack], function(error, results, fields) {
						if (error) throw error;
					});
					connection.query('INSERT INTO exercise_image (`image_title`, `image_src`, `exercise_id`) VALUES ?', [stack2], function(error, results, fields) {
						if (error) throw error;
					});
				  });
				}
			});
		} else {
			res.send("Please insert question data before submit!!!");
		}
		res.redirect('/home');
	}
})

router.get('/delEx/:week', (req, res) => {
	const { week } = req.params;
	connection.query('DELETE FROM exercise WHERE exercise_id = ?', [week], function(error, results, fields) {
	  if (error) throw error;
	  connection.query('DELETE FROM exercise_image WHERE exercise_id = ?', [week], function(error, results, fields) {
		if (error) throw error;
	  });
	  connection.query('DELETE FROM exercise_question WHERE exercise_id = ?', [week], function(error, results, fields) {
		if (error) throw error;
	  });
	});
	res.redirect('/home');
})

exports.router = router;