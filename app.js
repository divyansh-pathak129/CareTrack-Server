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
app.post('/', express.json({limit: '1mb'}), (req, res) => {
    console.log('Received HTTP POST data:', req.body);
    res.status(200).send('Data received');
});

// Add Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('Client connected');
    
    // Set up ping-pong for connection monitoring
    socket.conn.on('packet', (packet) => {
        if (packet.type === 'pong') {
            console.log('Client alive - received pong');
        }
    });

    // Configure socket timeout and reconnection
    socket.conn.setTimeout(5000);
    
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    socket.on('message', (data) => {
        console.log('Received Socket.IO message:', data);
    });

    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', reason);
    });
});

// Improve error handling for the server
server.on('error', (error) => {
    console.error('Server error:', error);
    // Attempt to recover from errors when possible
    if (error.code === 'EADDRINUSE') {
        console.log('Address in use, retrying...');
        setTimeout(() => {
            server.close();
            server.listen(PORT);
        }, 1000);
    }
});

// Keep-alive configuration for better persistence
server.keepAliveTimeout = 60000; // 60 seconds
server.headersTimeout = 65000; // slightly higher than keepAliveTimeout

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is Running on " + PORT));
