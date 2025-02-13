require('dotenv').config();
const http = require('http');
const express  = require('express');
const { Server } = require('socket.io');
const cors = require("cors");

const app = express()
app.use(cors());
const server = http.createServer(app)
const io = new Server(server, {
    cors:{
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Add route handler for HTTP requests
app.post('/', express.json(), (req, res) => {
    console.log('Received HTTP POST data:', req.body);
    res.status(200).send('Data received');
});

// Add Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('message', (data) => {
        console.log('Received Socket.IO message:', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
