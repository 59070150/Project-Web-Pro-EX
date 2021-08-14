const express = require("express");
const connection = require("../config");

router = express.Router();

router.get('/addnews', (req, res) => {
	if (req.session.loggedin == true) {
		res.render('addnews');
	} else {
		res.send('Please login to view this page!');
	}
})

router.post('/addnews', (req, res) => {
	let title = req.body.title;
	let week = req.body.week;
	let content = req.body.newscontent;
	if (content) {
		connection.query('INSERT INTO news (`news_title`, `week_id`, `news_content`, `created_by`) VALUES (?, (SELECT week_id FROM week WHERE week = ?), ?, (SELECT user_id FROM admin WHERE username = ?))', [title, week, content, req.session.username], function(error, results, fields) {
			if (error) throw error;
		});
		var msg = "Add news successfully!!!";
		res.redirect('/home');
	} else {
		var msg = "Please select week or add news content to complete!!!";
		res.render('addnews', {alertMsg: msg});
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