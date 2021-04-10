const express = require('express')
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express()
const port = 3000

app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/img'));

app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
	res.locals.loggedin = req.session.loggedin;
	res.locals.username = req.session.username;
	res.locals.isAdmin = req.session.isAdmin;
	res.locals.userId = req.session.id;
	next();
});
  

// routers
const indexRouter = require('./routes/index')
const authenRouter = require('./routes/authen')
const newsRouter = require('./routes/news')
const classRouter = require('./routes/class')
const exerciseRouter = require('./routes/exercise')
const settingRouter = require('./routes/setting')
const scoreRouter = require('./routes/score')


app.use(indexRouter.router)
app.use(authenRouter.router)
app.use(newsRouter.router)
app.use(classRouter.router)
app.use(exerciseRouter.router)
app.use(settingRouter.router)
app.use(scoreRouter.router)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})