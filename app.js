const express = require("express")
const dotenv = require("dotenv").config()
const path = require("path")
const cookieParser = require("cookie-parser")
const studentRoute = require("./Routes/student-route")
const adminRoute = require("./Routes/admin-route")
const app = express()
const userList=require('./utils/userList.json')
const http = require("http")
const { Server } = require("socket.io")
const fs=require('fs')
const { errorHandlingMiddleware } = require("./middleware/errorHandling")
const { NotFoundError } = require("./utils/error")
const { studentAuthMiddleware } = require("./utils/auth")
const server = http.createServer(app)
const io = new Server(server)
const chatFilePath=path.join(__dirname,'/utils/chatHistory.json')

const PORT = process.env.PORT

app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/student", studentRoute)
app.use("/admin", adminRoute)

app.get("/", (req, res) => {
  res.render("home",{ query: req.query })
})

app.use(errorHandlingMiddleware)


app.get('/student/chat/:currentUserId-:otherUserId',studentAuthMiddleware, (req, res, next) => {
   const currentUserId = parseInt(req.params.currentUserId, 10)  
   const otherUserId = parseInt(req.params.otherUserId, 10)

  const currentUser = userList.find(u => u.id === currentUserId)
  const otherUser = userList.find(u => u.id === otherUserId)
  const photo=otherUser.photo

  if (!currentUser || !otherUser) return next(new NotFoundError('Not Found'))

  const roomName = [currentUser.id, otherUser.id].sort((a, b) => a - b).join('_')
  res.render('chat', { currentUser, otherUser, roomName, photo })
})

io.on("connection", socket => {
  socket.on("joinPrivateRoom", (room) => {
    socket.join(room);
     const allMessages = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));
    const roomMessages = allMessages.filter(msg => msg.kind === 'private' && msg.room === room);
    roomMessages.forEach(msg => {
      socket.emit('singleMessage', { from: msg.from, msg: msg.text });
    });
});


  // Join a group room
  socket.on("joinRoom", ({ room, username }) => {
    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);

    // Read all messages
    const allMessages = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));

    // system join message
    const systemMsg = {
      kind: 'group',
      type: 'system',
      room,
      text: `${username} joined.`,
      date: Date.now()
    }
    allMessages.push(systemMsg);
    fs.writeFileSync(chatFilePath, JSON.stringify(allMessages, null, 2));

    // Send previous group messages
    const roomMessages = allMessages.filter(msg => msg.room === room && msg.kind === 'group');
    roomMessages.forEach(msg => socket.emit('message', msg));
    socket.to(room).emit('message', systemMsg);
  });

  // Group chats
  socket.on("groupMessage", ({ room, from, fromPhoto, text }) => {
    const allMessages = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));
    const newMsg = {
      kind: 'group',
      room,
      from,
      fromPhoto,
      text,
      date: Date.now()
    };
    allMessages.push(newMsg);
    fs.writeFileSync(chatFilePath, JSON.stringify(allMessages, null, 2));

    io.to(room).emit('message', { from, fromPhoto, text, type: 'user' });
  });

  // Private messages
  socket.on("singleMessage", ({ msg, from, room }) => {
    const allMessages = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));
    const newMsg = {
      kind: 'private',
      room,
      from,
      text: msg,
      date: Date.now()
    };
    allMessages.push(newMsg);
    fs.writeFileSync(chatFilePath, JSON.stringify(allMessages, null, 2));

    io.to(room).emit('singleMessage', { from, msg });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const username = socket.data.username;
    const room = socket.data.room;

    if (room && username) {
      const allMessages = JSON.parse(fs.readFileSync(chatFilePath, 'utf-8'));
      const systemMsg = {
        kind: 'group',
        type: 'system',
        room,
        text: `${username} left.`,
        date: Date.now()
      };
      allMessages.push(systemMsg);
      fs.writeFileSync(chatFilePath, JSON.stringify(allMessages, null, 2));

      io.to(room).emit('message', systemMsg);
    }
  });
});


server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})