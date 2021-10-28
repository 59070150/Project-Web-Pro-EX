const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/addnews', (req, res) => {
	if (req.session.loggedin == true) {
		if (req.session.semeterId) {
			connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
				if (error) throw error;
				if (results4.length > 0) {
					res.render('addnews', {weekData: results4});
				} else {
					res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เหลือ');
				}
			});
		} else {
			res.redirect('/semeter');
		}
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/addnews', (req, res) => {
	let title = req.body.title;
	let week = req.body.week;
	let content = req.body.newscontent;
	if (title && week && content) {
		connection.query('INSERT INTO news (`news_title`, `week_id`, `news_content`, `created_by`, `update_by`) VALUES (?, ?, ?, (SELECT user_id FROM admin WHERE username = ?), (SELECT user_id FROM admin WHERE username = ?))', [title, week, content, req.session.username, req.session.username], function(error, results, fields) {
			if (error) throw error;
		});
		var msg = "Add news successfully!!!";
		res.redirect('/home');
	} else {
		var msg = "Please select week or add news content to complete!!!";
		connection.query('SELECT * FROM week WHERE semeter_id = ?', [req.session.semeterId], function(error, results4, fields) {
			if (error) throw error;
			if (results4.length > 0) {
				res.render('addnews', {weekData: results4, alertMsg: msg});
			} else {
				res.send('ยังไม่มีข้อมูลในสัปดาห์ที่เหลือ');
			}
		});
	}
})

router.get('/editnews/:id', (req, res) => {
	const { id } = req.params;
	let newsId = parseInt(id);
	req.session.newsId = newsId;
	if (req.session.loggedin == true) {
		connection.query('SELECT * FROM news WHERE news_id = ?',[newsId] ,function(error, results) {
			let title = results[0].news_title;
			let content = results[0].news_content;
			res.render('editnews', {title: title, content: content, newsId: newsId});
		})
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/editnews/:id', (req, res) => {
	const { id } = req.params;
	let newsId = parseInt(id);
	let content = req.body.newscontent;
	let update = req.body.update;
	if (content && update) {
		connection.query('UPDATE news SET news_content = ?, update_date = CURRENT_TIMESTAMP, update_by = (SELECT user_id FROM admin WHERE username = ?) WHERE news_id = ?', [content, req.session.username, newsId], function(error, results, fields) {
			if (error) throw error;
			res.redirect('/home');
		})
	} else {
		res.send("Please select date to update news!!!");
	}
})

router.get('/news/:id', (req, res) => {
	const { id } = req.params;
	let newsId = parseInt(id);
	if (req.session.loggedin == true) {
		connection.query('SELECT * FROM news WHERE news_id = ?',[newsId] ,function(error, results) {
			let title = results[0].news_title;
			let content = results[0].news_content;
			res.render('news', {title: title, content: content});
		})
	} else {
		res.send('Please login to view this page!');
	}
})

router.get('/deletenews/:id', (req, res) => {
	const { id } = req.params;
	let newsId = parseInt(id);
	connection.query('DELETE FROM news WHERE news_id = ?',[newsId] ,function(error, results, fields) {
		if (error) throw error;
		res.redirect('/home');
	})
})

exports.router = router;