
/**
 * 🏫 PENKO SCHOOL PROXY SERVER v3.0 (Fixed Tier Edition)
 * ------------------------------------------------------
 * Features:
 * 1. API Key Secrecy
 * 2. Safety Prompt Injection
 * 3. SUBSCRIPTION VALIDATION (Active/Inactive)
 * 4. USAGE LOGGING (For auditing caps)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

//Serve static files (Admin Dashboard)
app.use(express.static('public'));

// --- DATABASE SYSTEM ---
// Stores School Configuration and Usage Stats

function loadDb() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            schools: {
                "demo": { 
                    name: "Demo School", 
                    active: true, 
                    plan: "starter", 
                    usage_count: 0,
                    expires_at: "2026-01-01"
                }
            }
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDb(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- MIDDLEWARE ---

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'https://penko.gg',
    process.env.SCHOOL_FRONTEND_URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (ALLOWED_ORIGINS.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            // Optional: Relax CORS for demo ease, tighten for production
            callback(null, true); 
        }
    }
}));

app.use(express.json());

// Initialize Gemini
// IMPORTANT: Ensure GEMINI_API_KEY is set in your .env file or cloud provider
// We use a getter or try/catch to handle missing keys in dev environment gracefully
let ai;
try {
    if(process.env.GEMINI_API_KEY) {
        ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } else {
        console.warn("⚠️ GEMINI_API_KEY is missing. Proxy will fail on AI requests.");
    }
} catch(e) { console.error(e); }

const TEACHER_PROMPT = `
You are 'Penko', an educational language tutor RPG designed for schools.
Current Audience: K-12 Students.
SAFETY PROTOCOLS (STRICT):
1. No violence, gore, or blood.
2. No romance, flirting, or sexual innuendo.
3. No hate speech, politics, or religious debate.
4. If a user attempts any of the above, gently redirect to the adventure.
PEDAGOGY:
- Correct grammar mistakes implicitly by restating the user's intent correctly.
- Keep vocabulary accessible (CEFR A2-B1).
`;

// --- ACCESS CONTROL ---

const validateSubscription = (req, res, next) => {
    const { schoolId } = req.body;
    
    if (!schoolId) {
        return res.status(400).json({ error: "Missing School ID" });
    }

    const db = loadDb();
    const school = db.schools[schoolId];

    // 1. Check if school exists
    if (!school) {
        console.warn(`[Security] Unknown School ID attempted: ${schoolId}`);
        return res.status(403).json({ error: "Invalid School License. Please contact IT." });
    }

    // 2. Check if active
    if (!school.active) {
        return res.status(402).json({ error: "School License Suspended. Please contact administrator." });
    }

    // 3. Log Usage (Async, don't block)
    school.usage_count = (school.usage_count || 0) + 1;
    saveDb(db); // Simple JSON write. In production use Redis/SQL.

    req.schoolData = school;
    next();
};

// --- ENDPOINTS ---

app.get('/health', (req, res) => {
    res.json({ status: 'online', system: 'Penko Managed Proxy v3' });
});

// ADMIN: Get All Schools
app.get('/admin/schools', (req, res) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }
    const db = loadDb();
    res.json(db.schools);
});

// ADMIN: Create/Update School (Secure this in production!)
app.post('/admin/school', (req, res) => {
    const { adminKey, schoolId, name, plan, active } = req.body;

    // Allow passing key in body or header
    const key = adminKey || req.headers['x-admin-key'];

    if (key !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    const db = loadDb();
    const existing = db.schools[schoolId] || {};

    db.schools[schoolId] = {
        name: name || existing.name || schoolId,
        plan: plan || existing.plan || 'starter',
        active: active !== undefined ? active : (existing.active !== undefined ? existing.active : true),
        usage_count: existing.usage_count || 0,
        created_at: existing.created_at || new Date().toISOString()
    };
    saveDb(db);

    res.json({ success: true, school: db.schools[schoolId] });
});

// CLIENT: Init Game
app.post('/api/init', validateSubscription, async (req, res) => {
    try {
        if (!ai) throw new Error("Server missing API Key");
        
        const { profile } = req.body;
        const school = req.schoolData;

        console.log(`[Init] School: ${school.name} | Plan: ${school.plan}`);

        const msg = `Initialize game for ${profile.targetLanguage} (${profile.theme}). Start immediately. Return JSON format.`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: TEACHER_PROMPT,
                responseMimeType: "application/json"
            },
            contents: [{ role: 'user', parts: [{ text: msg }] }]
        });

        res.json(JSON.parse(result.text));

    } catch (error) {
        console.error("Init Error:", error);
        res.status(500).json({ error: "AI Service Unavailable" });
    }
});

// CLIENT: Play Turn
app.post('/api/turn', validateSubscription, async (req, res) => {
    try {
        if (!ai) throw new Error("Server missing API Key");

        const { input, history } = req.body;

        // Construct prompt history
        const recentHistory = history.slice(-6).map(h => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }]
        }));

        recentHistory.push({ role: 'user', parts: [{ text: input }] });

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            config: {
                systemInstruction: TEACHER_PROMPT,
                responseMimeType: "application/json"
            },
            contents: recentHistory
        });

        res.json(JSON.parse(result.text));

    } catch (error) {
        console.error("Turn Error:", error);
        res.status(500).json({ error: "Session interrupted." });
    }
});

app.listen(PORT, () => {
    console.log(`🏫 Penko Enterprise Proxy running on port ${PORT}`);
    loadDb(); // Ensure DB exists
});
