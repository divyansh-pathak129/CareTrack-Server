const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.text());

// Create HTTP server using Express app
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Data storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sensor_data.txt');

// Ensure data directory exists
(async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
})();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
        const data = {
            timestamp: timestamp,
            value: req.body
        };

        console.log(`Received Data: ${req.body}`);
        
        // Emit to all connected clients
        io.emit('newData', data);
        
        // Save to file
        await fs.appendFile(DATA_FILE, `[${timestamp}] ${req.body}\n`);
        
        res.status(200).send('Data Received');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing data');
    }
});

const PORT = 5000;
// Use the HTTP server instead of Express app to listen
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
