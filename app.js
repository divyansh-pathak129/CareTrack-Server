require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

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
        console.log(`Data received: [${timestamp}] ${data}`);        
        res.status(200).send('Data received');
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).send('Error processing data');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server is Running on " + PORT));
