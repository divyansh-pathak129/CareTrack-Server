const express = require('express');
const bodyParser = require('body-parser');
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
app.use(bodyParser.text()); // Changed to text parser instead of JSON

app.post('/', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
        
        // Split the incoming data into lines
        const lines = req.body.split('\n');
        
        // Process each line
        for (const line of lines) {
            if (line.startsWith('$') && line.endsWith('#')) {
                // Remove $ and # symbols
                const cleanData = line.slice(1, -1);
                
                // Split by comma
                const [time, acceleration, gyro, temperature, ecg, bpm] = cleanData.split(',');
                
                // Create structured data object
                const parsedData = {
                    time,
                    acceleration: parseFloat(acceleration),
                    gyro: parseFloat(gyro),
                    temperature: parseFloat(temperature),
                    ecg: parseInt(ecg),
                    bpm: parseInt(bpm)
                };

                console.log('Received Data(RAW):', req.body);
                console.log('Received Data:', cleanData);
                console.log('Parsed Data:', parsedData);
                
                // Save to file in a more structured format
                await fs.appendFile(
                    DATA_FILE, 
                    `[${timestamp}] ${JSON.stringify(parsedData)}\n`
                );
            }
        }
        
        res.status(200).send('Data Received and Parsed');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing data');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
