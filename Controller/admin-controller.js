const { generateAdminToken } = require("../utils/auth");
const { UnAuthorized, NotFoundError } = require("../utils/error");
const jwt = require('jsonwebtoken')
const dotenv=require('dotenv').config()
const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../utils/userList.json");
const userList = JSON.parse(fs.readFileSync(filePath, "utf-8"));
const secretKey=process.env.secretKey

function writeFile() {
  fs.writeFileSync(filePath, JSON.stringify(userList, null, 2));
}

//Login Page
const loginGet = (req, res) => {
  const token = req.cookies.Admin_Token
  if (token) {
    try {
      jwt.verify(token, secretKey)
      return res.redirect('/admin/profile2')
    } catch (err) {
      console.log(err.message)
    }
  }
  res.render("login2");
};
const loginPost = (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = userList.find((u) => u.username === username && u.password === password)
    if (!admin) {
      return next(new NotFoundError("No User Found"));
    }
    if (admin.role !== "admin") {
      return next(new UnAuthorized("The Role is Mismatched!"));
    }
    res.cookie("Admin_Token", generateAdminToken(admin), {
      httpOnly: true,
      maxAge: 3600000,
    });
    res.redirect("/admin/profile2"); //redirect does not accept template as render does
  } catch (err) {
    next(err);
  }
};

//Profile page
const profile2 = (req, res) => {
  res.render("profile2", {
    username: req.user.username,
    age: req.user.age,
    email: req.user.email,
    role: req.user.role,
    id: req.user.id,
  });
};

//Files upload page
const fileUpload = (req, res) => {
  res.render("fileUpload", { message: "" });
};

//Student List
const studentList2 = (req, res) => {
  const students = userList.filter((val) => val.role === "student");
  res.render("studentList2", { students });
};

//Add Student
const addStudentGet = (req, res) => {
  res.render("addStudent");
};

//Edit Student
const editStudentGet = (req, res) => {
  const studentId = parseInt(req.params.id);
  const student = userList.find((u) => u.id === studentId);
  res.render("editStudent", { student });
};
const editStudentPost = (req, res) => {
  const studentId = parseInt(req.params.id);
  const { username, age, email, course } = req.body
  const student = userList.find((u) => u.id === studentId);
  if (student) {
    student.username = username;
    student.age = age;
    student.email = email;
    student.course = course;
  }
  writeFile();
  res.redirect("/admin/studentList2");
};

//Delete Student
const deleteStudentPost = (req, res) => {
  const studentId = parseInt(req.params.id); //params.id in url is string. so converting to integer
  const index = userList.findIndex((s) => s.id === studentId);
  if (index !== -1) {
    userList.splice(index, 1); //array.splice(startIndex,deleteCount,item1,item2,...)
    writeFile();
  }
  res.redirect("/admin/studentList2");
};



module.exports = {
  fileUpload,
  loginGet,
  filePath,
  userList,
  writeFile,
  loginPost,
  profile2,
  editStudentPost,
  addStudentGet,
  deleteStudentPost,
  studentList2,
  editStudentGet,
};