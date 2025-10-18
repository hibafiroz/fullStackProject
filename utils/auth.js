const jwt = require("jsonwebtoken")
const { NotFoundError } = require("./error")
const dotenv = require("dotenv").config()
const secretKey = process.env.secretKey


//Student Token Generation
function generatestudentToken(student) {
  const options = { expiresIn: "1h" }
  const payload = {
    id: student.id,
    username: student.username,
    age:student.age,
    email: student.email,
    course:student.course,
    role: student.role,
    photo: student.photo
  }
  return jwt.sign(payload, secretKey, options);
}


//Student Authentication Middleware
const studentAuthMiddleware = (req, res, next) => {
  console.log('entered')
  try {
    const token = req.cookies ?.Student_Token
    if (!token) {
      return next(new NotFoundError("Please Login First!"))
    } else {
      const decoded = jwt.verify(token, secretKey)
      req.user = decoded; //storing logged in user details from token into the request
      next()
    }
  } catch (err) {
    next(err);
  }
}


//Admin Toke Generation
function generateAdminToken(admin) {
  const payload = { id: admin.id, username: admin.username, role: admin.role, email: admin.email, age: admin.age }
  const options = { expiresIn: "1h" }
  return jwt.sign(payload, secretKey, options)
}


//Admin Authentication Middleware
const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.Admin_Token
    if (!token) {
      return next(new NotFoundError("Please Login First"))
    }
    const decoded = jwt.verify(token, secretKey)
    // if(decoded.role!=='admin'){
    //     return next(new(NotFoundError('The Role is Mismatched!')))
    // }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin Auth Error:", err.message)
    next(err)
  }
}


//Cache
const preventCache= (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next();
};


//Student LogOut 
const logoutStudentCookie = (req, res) => {
  res.clearCookie('Student_Token', {
    httpOnly: true,
    sameSite: 'Strict',
  })
  res.redirect('/')
}


//Admin LogOut
const logoutAdminCookie = (req, res) => {
  res.clearCookie('Admin_Token', {
    httpOnly: true,
    sameSite: 'Strict'
  })
  res.redirect('/')
}

module.exports = {generateAdminToken, logoutAdminCookie, logoutStudentCookie, generatestudentToken, preventCache, studentAuthMiddleware, adminAuthMiddleware}