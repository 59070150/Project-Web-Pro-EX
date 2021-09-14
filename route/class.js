const express = require("express");
const connection = require("../config");
const path = require("path");
const multer = require("multer");

router = express.Router();

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, './routes/uploads');
  },
  filename: function(req, file, callback) {
    callback(null, file.originalname);
  }
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.mimetype === 'application/x-rar-compressed' ||
    file.mimetype === 'application/x-zip-compressed'
  ) { // check file type to be pdf, doc, or docx
    callback(null, true);
  } else {
    callback(null, false); // else fails
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter })

router.get('/classWeek/:week', (req, res) => {
	const { week } = req.params;
	if (req.session.loggedin == true) {
    connection.query('SELECT * FROM class_material WHERE class_id = ?', [week], function(error, results1, fields) {
      if (error) throw error;
      let description = results1[0].class_description;
      connection.query('SELECT * FROM class_material_video_link WHERE class_id = ?', [week], function(error, results2, fields) {
        if (error) throw error;
        connection.query('SELECT * FROM class_material_file WHERE class_id = ?', [week], function(error, results3, fields){
          if (error) throw error;
          connection.query('SELECT * FROM class_material_project_example WHERE class_id = ?', [week], function(error, results4, fields){
            if (error) throw error;
            res.render('classWeek', {week: week, desc: description, vidData: results2, fileData: results3, projData: results4});
          });
        });
      });
    });
	} else {
	  res.send('Please login to view this page!');
  }
})

router.get('/editClass/:week', (req, res) => {
    const { week } = req.params;
    if (req.session.loggedin == true) {
      connection.query('SELECT * FROM class_material WHERE class_id = ?', [week], function(error, results1, fields) {
        if (error) throw error;
        let description = results1[0].class_description;
        res.render('editClass', {week: week, desc: description});
      });
    } else {
      res.send('Please login to view this page!');
    }
})

router.get('/addClass', (req, res) => {
  if (req.session.loggedin == true) {
    res.render('addClass');
  } else {
    res.send('Please login to view this page!');
  }
})

router.post('/addClass', upload.fields([{ name: 'classDocs', maxCount: 5 }, { name: 'classProj', maxCount: 5 }]), (req, res) => {
  let week = req.body.week;
  let classTitle = req.body.classTitle;
  let classId = parseInt(week);
  let videoTitle = req.body.videoName;
  let videoLink = req.body.videoUrl;
  let classDescription = req.body.classDesc;
  let video = [];
  let stack = [];
  let filesDocs = req.files['classDocs'];
  let filesProj = req.files['classProj'];
  if (!filesDocs) {
    res.send("Please insert file to upload!!!");
  } else if (!filesProj) {
    res.send("Please insert class project file to upload!!!");
  } else if (week && classTitle) {
    let fileD = [];
    let stack2 = [];
    for (let j = 0; j < filesDocs.length; j++) {
      fileD.push(filesDocs[j].filename, filesDocs[j].path, classId);
      stack2.push(fileD);
      fileD = [];
    }
    let fileP = [];
    let stack3 = [];
    for (let k = 0; k < filesProj.length; k++) {
      fileP.push(filesProj[k].filename, filesProj[k].path, classId);
      stack3.push(fileP);
      fileP = [];
    }
    for (let i = 0; i < videoTitle.length; i++){
      if (videoTitle[i] != '' && videoLink[i] != ''){
        video.push(videoTitle[i], videoLink[i], classId);
        stack.push(video);
        video = [];
      } else {
        stack = [];
      }
    }
    if (stack != []) {
      connection.query('SELECT * FROM class_material WHERE class_id = ?', [classId], function(error, resultsC, fields) {
        if (resultsC.length > 0) {
          res.send('This week has data already');
        } else {
          connection.query('INSERT INTO class_material (`class_id`, `class_title`, `class_description`, `week_id`, `created_by`, `update_by`) VALUES (?, ?, ?, (SELECT week_id FROM week WHERE week = ?), (SELECT user_id FROM admin WHERE username = ?), (SELECT user_id FROM admin WHERE username = ?))', [classId, classTitle, classDescription, classId, req.session.username, req.session.username], function(error, results, fields) {
            if (error) throw error;
            connection.query('INSERT INTO class_material_file (`file_title`, `file_src`, `class_id`) VALUES ?', [stack2], function(error, results, fields) {
              if (error) throw error;
            });
            connection.query('INSERT INTO class_material_project_example (`project_title`, `project_src`, `class_id`) VALUES ?', [stack3], function(error, results, fields) {
              if (error) throw error;
            });
            connection.query('INSERT INTO class_material_video_link (`video_title`, `video_URL`, `class_id`) VALUES ?', [stack], function(error, results, fields) {
              if (error) throw error;
            });
          });
        }
      });
    } else {
      res.send('Please insert video data before submit!!!');
    }
    res.redirect('/home');
  } else {
    res.send('Please select week and insert classname!!!');
  }
})

router.get('/download/:path1/:path2/:name', (req, res) => {
  const { path1, path2, name } = req.params;
  const directoryPath = __dirname + '/' + path2 + '/';

  res.download(directoryPath + name, name, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
})

exports.router = router;