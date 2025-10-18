const express = require('express')
const { loginGet, loginPost, profile, studentList, groupList, groupChat, editStudent2Get, editStudent2Post } = require('../Controller/student-controller')
const { studentAuthMiddleware, logoutStudentCookie, preventCache } = require('../utils/auth')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const filePath = path.join(__dirname, '../utils/bulletins.json')


//Routes
router.get('/login', preventCache ,loginGet)
router.post('/login', loginPost)
router.get('/profile', studentAuthMiddleware, profile)
router.get('/logout', logoutStudentCookie)
router.get('/studentList', studentAuthMiddleware, studentList)
router.get('/groupList',studentAuthMiddleware, groupList)
router.get('/groupChat/:groupName', studentAuthMiddleware, groupChat)
router.get('/editStudent2', studentAuthMiddleware, editStudent2Get)
router.post('/editStudent2',studentAuthMiddleware,editStudent2Post)


//Uplaoded File
router.get('/studentPage', studentAuthMiddleware, (req, res) => {
    const data = fs.readFileSync(filePath, 'utf-8')
    const files = JSON.parse(data)
    const uploadTime=Date.now()
    res.render('studentPage', { files, uploadTime })
})

module.exports = router