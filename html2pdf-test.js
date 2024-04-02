const fs = require('fs');
const { pipeline } = require('stream/promises');

const noProgress = process.argv.includes('--no-progress');

async function generatePDF(jobId, html, pdfPath) {
    const start = process.hrtime.bigint();
    try {
        const response = await fetch('http://localhost:3000/pdf', {
            method: 'POST',
            body: JSON.stringify({ jobId, html }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error(`Unexpected response ${response.statusText}`);
        }
        await pipeline(response.body, fs.createWriteStream(pdfPath));
    } catch (err) {
        console.error(err);
    }
    const end = process.hrtime.bigint();
    if (!noProgress) console.log(`${pdfPath} in ${(end - start) / BigInt(1e6)}ms`);
}
if (!fs.existsSync('data')) fs.mkdirSync('data');

const promises = [];
const template = fs.readFileSync('template.html', 'utf8');
const overallStart = process.hrtime.bigint();
for (let i = 0; i < 100; i++) {
    const promise = new Promise((resolve) => {
        const seqNo = i;
        setTimeout(() => {
            const randomNum = Math.floor(Math.random() * 1000);
            const htmlContent = template
                .replace('#Name#', 'User ' + seqNo)
                .replace('#Number#', randomNum);        
            resolve(generatePDF('Job' + seqNo, htmlContent, 'data/result-' + seqNo + '.pdf'));
        }, 100 * i);
    });
    promises.push(promise);
}

Promise.all(promises).then(() => {
    const overallEnd = process.hrtime.bigint();
    console.log(`Overall time: ${(overallEnd - overallStart) / BigInt(1e6)}ms`);
});
