const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

// Data storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sensor_data.txt');

// Buffer for collecting packages
let dataBuffer = [];
const PACKAGE_COUNT = 6;

// Function to parse data string
function parseData(data) {
    // Remove $ and # symbols and split by comma
    const values = data.replace(/[\$\#]/g, '').split(',');
    return {
        time: values[0],
        voltage: parseFloat(values[1]),
        current: parseFloat(values[2]),
        temperature: parseFloat(values[3]),
        rpm: parseFloat(values[4]),
        direction: parseInt(values[5])
    };
}

// Function to calculate averages
function calculateAverages(buffer) {
    const sums = buffer.reduce((acc, data) => {
        acc.voltage += data.voltage;
        acc.current += data.current;
        acc.temperature += data.temperature;
        acc.rpm += data.rpm;
        return acc;
    }, { voltage: 0, current: 0, temperature: 0, rpm: 0 });

    return {
        time: buffer[buffer.length - 1].time,
        voltage: (sums.voltage / buffer.length).toFixed(2),
        current: (sums.current / buffer.length).toFixed(2),
        temperature: (sums.temperature / buffer.length).toFixed(2),
        rpm: Math.round(sums.rpm / buffer.length),
        direction: buffer[buffer.length - 1].direction
    };
}

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
        const data = parseData(req.body);
        dataBuffer.push(data);

        if (dataBuffer.length >= PACKAGE_COUNT) {
            const averages = calculateAverages(dataBuffer);
            const timestamp = new Date().toISOString().replace('T', ' ').substr(0, 19);
            
            const outputStr = `[${timestamp}] Average of 6 readings: ` +
                `Voltage=${averages.voltage}V, ` +
                `Current=${averages.current}A, ` +
                `Temp=${averages.temperature}°C, ` +
                `RPM=${averages.rpm}, ` +
                `Direction=${averages.direction}`;

            console.log(outputStr);
            await fs.appendFile(DATA_FILE, outputStr + '\n');
            
            // Clear buffer after processing
            dataBuffer = [];
        }
        
        res.status(200).send('Data Received');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error processing data');
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
