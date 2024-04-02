const express = require('express');
const playwright = require('playwright');
const fastq = require('fastq');

const app = express();
const port = 3000;

const worker = async (task, callback) => {
    const browser = await playwright.chromium.launch();
    try {
        const context = await browser.newContext();
        const page = await context.newPage();
        if (task.url) {
            await page.goto(task.url);
        } else if (task.html) {
            await page.setContent(task.html);
        }
        const pdf = await page.pdf();
        callback(null, pdf);
    } catch (error) {
        callback(error);
    }
    finally{
        await browser.close();
    }
};

const concurrency = parseInt(process.argv[2]) || 4;
const queue = fastq(worker, concurrency);
app.post('/pdf', express.json(), async (req, res) => {
    const postData = req.body;
    if (!postData.url && !postData.html) {
        return res.status(400).send('Missing parameter');
    }
    queue.push(postData, (err, result) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.send(result);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});