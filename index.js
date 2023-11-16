const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("server rounin on ");
});

let users = [];

io.on("connection", (socket) => {
  console.log(`${socket.id} is connected`);

  socket.emit("me", socket.id);

  socket.on("newUser", (user) => {
    console.log(user);
    users.push(user);
    io.emit("activeUsers", users);
  });

  socket.on("callUser", ({ from, to, signal, userName }) => {
    io.to(to).emit("call", { from, signal, userName });
  });

  socket.on("ansCall", ({ from, to, signal, userName }) => {
    console.log(to);
    io.to(to).emit("callAnswered", { from, signal, userName });
  });

  socket.on("disconnect", () => {
    const updatedUsers = users.filter((user) => {
      return user.socketId != socket.id;
    });
    users = updatedUsers;
    io.emit("activeUsers", users);
  });
});

server.listen(5000, () => console.log("Server is running on port 5000"));
