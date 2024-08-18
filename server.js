const express = require('express');
const fs = require('fs');
const path = require('path');

const scrapeWebPage = require('./scraper'); // Import the scrapeWebPage function from scraper.js
const clientPromise = require('./mongodb.js'); // Import the MongoDB connection

const app = express();

const port = 3000;

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files (e.g., CSS, JS, images) from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the input form at the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));  // Serve the index.html file
});

app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'landing.html'));  // Serve the index.html file
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));  // Serve the index.html file
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));  // Serve the index.html file
});

// Handle form submission to scrape the URL
app.post('/scrape', async (req, res) => {
    const url = req.body.url;

    try {
        // Perform the actual scraping
        await scrapeWebPage(url);

        // Redirect to the result page after scraping
        res.redirect('/result');
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).send('An error occurred while scraping the data.');
    }
});

// Serve the result page after scraping
app.get('/result', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'result.html'));  // Serve the result.html file
});

// New API endpoint to fetch the latest scraped data
app.get('/api/scraped-data', async (req, res) => {
    const client = await clientPromise;

    try {
        await client.connect();
        const db = client.db("scrappedInfo");
        const collection = db.collection("webInfo");

        // Fetch the latest scraped data
        const latestData = await collection.findOne({}, { sort: { date: -1 } });

        if (!latestData) {
            return res.status(404).send('No scraped data found.');
        }

        // Send the latest data as JSON
        res.json(latestData);
    } catch (error) {
        console.error('Error fetching the data:', error);
        res.status(500).send('An error occurred while fetching the data.');
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
