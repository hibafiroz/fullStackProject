const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { loginGet, loginPost, profile2, studentList2, addStudentGet, deleteStudentPost, editStudentGet, editStudentPost, fileUpload, writeFile, userList, filePath } = require('../Controller/admin-controller')
const { adminAuthMiddleware, logoutAdminCookie, preventCache } = require('../utils/auth')
const { Duplicates } = require('../utils/error')


//File Upload using Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.path.includes("fileUpload")) {
      cb(null, 'public/uploads');  // folder for admin files 
    } else if (req.path.includes("addStudent")) {
      cb(null, 'public/photos');   // folder for student files
    }
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Choose JSON file based on route
function getfile(req) {
  if (req.path.includes("fileUpload")) {
    return path.join(__dirname, "../utils/bulletins.json");
  }
}

router.post('/fileUpload', upload.single('file'), (req, res) => {
  const filePath = getfile(req);

  if (req.file) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    data.push({
      filename: req.file.filename,
      uploadTime: new Date().toISOString()
    });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.render('fileUpload', { message: 'File Uploaded Successfully' });
  } else {
    res.render('fileUpload', { message: 'Upload Failed' });
  }
})


router.get('/login',preventCache, loginGet)
router.post('/login', loginPost)
router.get('/profile2', adminAuthMiddleware, profile2)
router.get('/logout',logoutAdminCookie)
router.get('/fileUpload', adminAuthMiddleware ,fileUpload)
router.get('/studentList2/addStudent', adminAuthMiddleware, addStudentGet)

router.post('/studentList2/addStudent', upload.single("photo"), (req, res, next) => {
  const { username, age, email, course, role } = req.body;
  const photo = req.file? req.file.filename:null         //Multer stores uploaded files in req.file (for single file) or req.files (for multiple). not in req.body
  const user = { id: Number(String(Date.now()).slice(-3)), username, password: '123456', age, email, role, course, photo }
  if (userList.some(u=>u.username===user.username)) {
    return next(new Duplicates('User Already Exist'))
  }
  userList.push(user)
  writeFile()
    res.redirect("/admin/studentList2");
  }
)


router.get('/studentList2', adminAuthMiddleware, studentList2)
router.post('/studentList2/deleteStudent/:id',adminAuthMiddleware, deleteStudentPost)
router.get('/studentList2/editStudent/:id', adminAuthMiddleware ,editStudentGet)
router.post('/studentList2/editStudent/:id',adminAuthMiddleware, editStudentPost)


module.exports = router