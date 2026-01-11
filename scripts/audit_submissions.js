
/**
 * Penko Automated Content Auditor
 * 
 * Usage:
 * 1. Place JSON submissions in ./submissions/
 * 2. Set GEMINI_API_KEY env variable
 * 3. Run `node scripts/audit_submissions.js`
 * 
 * This will sort files into ./submissions/passed and ./submissions/review
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
const SUBMISSIONS_DIR = './submissions';
const PASSED_DIR = './submissions/passed';
const REVIEW_DIR = './submissions/review';

if (!API_KEY) {
    console.error("❌ Error: GEMINI_API_KEY environment variable not set.");
    process.exit(1);
}

// Ensure directories exist
[SUBMISSIONS_DIR, PASSED_DIR, REVIEW_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function callGemini(content) {
    const prompt = `
    You are a strict content moderator for a PG-13 language learning game.
    Review this JSON content for:
    1. Hate speech / Racism
    2. Sexual content
    3. Extreme violence
    4. Spam / Gibberish

    Content: ${JSON.stringify(content)}

    Return JSON ONLY: { "status": "PASS" | "FAIL", "reason": "string" }
    `;

    const data = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) resolve(JSON.parse(text));
                    else reject("No response text");
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function processFiles() {
    const files = fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith('.json'));
    console.log(`🔍 Found ${files.length} submissions to audit...\n`);

    for (const file of files) {
        const filePath = path.join(SUBMISSIONS_DIR, file);
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`Processing ${file}...`);
            
            const result = await callGemini(content);
            
            if (result.status === 'PASS') {
                console.log(`✅ PASS: ${file}`);
                fs.renameSync(filePath, path.join(PASSED_DIR, file));
            } else {
                console.log(`🚩 FLAGGED: ${file} (${result.reason})`);
                // Append reason to file for manual reviewer
                content._audit_reason = result.reason;
                fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
                fs.renameSync(filePath, path.join(REVIEW_DIR, file));
            }
            
            // Rate limit help
            await new Promise(r => setTimeout(r, 1000));

        } catch (e) {
            console.error(`❌ Error processing ${file}:`, e.message);
        }
    }
    console.log("\n✨ Audit Complete.");
}

processFiles();
