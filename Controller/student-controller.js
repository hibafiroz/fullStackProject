const { generatestudentToken } = require("../utils/auth")
const { UnAuthorized, NotFoundError } = require("../utils/error")
const dotenv=require('dotenv').config()
const fs = require('fs')
const path = require('path')
const filePath = path.join(__dirname, '../utils/userList.json')
const userList = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
const jwt=require('jsonwebtoken')
const secretKey = process.env.secretKey


//Login Page
const loginGet = (req, res) => {
    const token = req.cookies.Student_Token
    if (token) {
        try {
            jwt.verify(token, secretKey)
            return res.redirect('/student/profile')
        } catch (err) {
            console.log("JWT error:", err.message)
        }
    }
    res.render('login');
}

const loginPost = (req, res, next) => {
    try{
        const { username, password } = req.body
        const student = userList.find(u => u.username === username && u.password === password)  //find will automatically give all other details of that person
        if (!student) {
            return next(new NotFoundError('No user Found'))
        }
        if (student.role !== 'student') {
            return next(new UnAuthorized('The Role is Mismatched!'))
        }
        res.cookie('Student_Token', generatestudentToken(student), { httpOnly: true, maxAge: 3600000 })
        res.redirect('/student/profile')
    } catch (err) {
        next(err)
    }
}


//Profile Page
const profile = (req, res) => {  
    res.render('profile', {
        username: req.user.username,
        age: req.user.age,
        role: req.user.role,
        email:req.user.email,
        id: req.user.id,
        course: req.user.course,
        photo: req.user.photo
    })
}


//Student List
const studentList = (req, res) => {
   const currentUser = req.user;
  const students = userList.filter(u => u.role === 'student');

  res.render('studentList', {
      students,
      photo:currentUser.photo,
      currentUser
  });
};

const groups = [
  { name: 'The Scholars Circle', image: '/images/groupChat2.jpeg' },
  { name: 'Unity Club', image: '/images/groupChat3.jpeg' },
  { name: 'Jumpstart Juniors', image: '/images/groupChat.jpeg' },
  { name: 'Math Club', image: '/images/groupChat4.jpeg' },
  { name: 'Art Avengers', image: '/images/groupChat5.jpeg' }
];

//Group List
const groupList = (req, res) => {
    const photo=req.user.photo
    res.render('groupList', { groups, photo })
}


//Group Chat
const groupChat = (req, res) => {
    const username = req.user.username
    const photo=req.user.photo
    const groupName = req.params.groupName
    const group = groups.find((p) => p.name.replace(/\s+/g, '')===groupName)
    const groupPhoto=group.image
    res.render('groupChat', { username, groupName, groupPhoto, photo })
}

const editStudent2Get = (req, res) => {
    const studentID = parseInt(req.user.id)
    const student = userList.find((u => u.id === studentID))
    res.render('editStudent2', {student})
}

const editStudent2Post = (req, res) => {
    const { username, age, email, course } = req.body
    const student = userList.find((u) => u.username === req.user.username)
    
    if(student){
        student.username=username,
        student.age=age,
        student.email=email,
        student.course=course
    }
    fs.writeFileSync(filePath,JSON.stringify(userList,null,2))
    res.redirect('/student/profile')
}


module.exports = { loginGet, loginPost, profile, studentList , groupList, groupChat,editStudent2Get,editStudent2Post }