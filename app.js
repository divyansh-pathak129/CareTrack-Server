require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Data storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sensor_data.txt');

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

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', async (req, res) => {
    try {
        const data = req.body;
        const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
        
        // Save to file
        await fs.appendFile(DATA_FILE, `[${timestamp}] ${JSON.stringify(data)}\n`);
        
        console.log(`Data received: [${timestamp}] ${JSON.stringify(data)}`);
        console.log(`Data received: [${timestamp}] data`);        
        res.status(200).send('Data received');
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is Running on " + PORT));
