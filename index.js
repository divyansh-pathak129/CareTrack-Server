const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware to parse text data
app.use(bodyParser.text());

// Route to receive ESP32 data
app.post("/", (req, res) => {
    console.log("Received Data:", req.body);

    // You can process the data here (e.g., save to a database or file)
    
    res.status(200).send("Data Received");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});