require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const twilio = require('twilio');
// Data storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sensor_data.txt');

const app = express();
app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});


const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

console.log(accountSid);
console.log(authToken);

const client = twilio(accountSid, authToken);

async function sendSMS(to, message) {
    try {
        const response = await client.messages.create({
            body: message, // The SMS message body
            from: '+15393997445', // Your Twilio phone number
            to: to, // The recipient's phone number,
            username: "himanshu",
        });
        console.log(`SMS sent successfully! Message SID: ${response.sid}`);
        return response;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
}

// Ensure data directory exists
(async () => {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
})();


io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('fallDetected', async (data) => {
        try {
            console.log('Fall Detected, Sending SMS');
            await sendSMS('+916396192629', 'Fall Detected');
        } catch (error) {
            console.error('Error sending SMS:', error);
        }
    }
    );
});


app.post('/', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);

        let rawData = req.body;
        
        // Ensure rawData is a string if it's not already
        if (typeof rawData !== 'string') {
            rawData = JSON.stringify(req.body);
        }

        const cleanData = rawData.replace(/^\$/, '').replace(/#$/, '');
        const [timeStr, ...values] = cleanData.split(',');

        const parsedData = {
            sensorTime: timeStr,
            timestamp: timestamp,
            values: {
                acceleration: parseFloat(values[0]),
                gyro: parseFloat(values[1]),
                temperature: parseFloat(values[2]),
                ecg: parseInt(values[3]),
                bpm: parseInt(values[4]),
                fallDetection: parseInt(values[5]),
                egrConnection: parseInt(values[6]),
            },
        };

        console.log('Parsed Data:', parsedData);
        
        io.emit('newData', parsedData);
        
        await fs.appendFile(
            DATA_FILE, 
            `[${timestamp}] Raw: ${rawData} | Parsed: ${JSON.stringify(parsedData)}\n`
        );
        
        res.status(200).send('Data Received');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing data');
    }
});


const PORT = 5000;
// Use the HTTP server instead of Express app to listen
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
