require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ No API KEY found');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Access the model manager to list models - wait, the SDK might not expose it directly on genAI instance easily in all versions.
        // Let's try a direct fetch if SDK doesn't have it, or use the model's list method if available.
        // Actually, for this SDK version, it might be different.
        // Let's try the standard way if possible, or just try 'gemini-pro'.

        // But to be sure, let's try 'gemini-pro' in reproduction script first. 
        // If that fails, I'll assume I need to check docs or just try 'gemini-1.5-pro'.

        console.log("Listing models via API...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.log("No models found or error:", data);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

listModels();
