require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGen() {
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ No API KEY found');
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using the same model as server.js
        const modelName = 'gemini-2.0-flash';
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const age = 25;
        const weight = 70;
        const height = 175;
        const gender = 'male';
        const activityLevel = 'moderate';
        const goalType = 'maintain';
        const targetCalories = 2500;
        const allergyList = [];

        const mealPrompt = `You are a professional nutritionist creating a HIGHLY PERSONALIZED 7-DAY meal plan.

USER PROFILE:
- Age: ${age} years
- Weight: ${weight} kg
- Height: ${height} cm
- Gender: ${gender}
- Activity Level: ${activityLevel}
- Goal: ${goalType.replace('_', ' ')}
- Target Calories: ${targetCalories} calories/day
- Allergies/Restrictions: ${allergyList.length > 0 ? allergyList.join(', ') : 'None'}

⚠️ CRITICAL DIETARY RESTRICTIONS - MUST FOLLOW:
- No dietary restrictions

IMPORTANT: 
1. Create a UNIQUE 7-DAY meal plan based on this user's exact profile
2. DO NOT use generic/template meals
3. NEVER include any restricted foods mentioned above
4. If user cannot eat NONVEG/meat, suggest ONLY vegetarian protein sources
5. Ensure variety across the 7 days

For maintenance, balanced macros

Provide a JSON response with this EXACT structure (NO markdown, ONLY JSON):
{
  "day1": {
    "breakfast": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "lunch": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "dinner": { "name": "...", "description": "...", "ingredients": ["..."], "preparation": "...", "calories": 0, "protein": "...", "carbs": "...", "fats": "..." },
    "snacks": { "name": "...", "description": "...", "items": ["..."], "calories": 0 }
  },
  "day2": { ... same structure ... },
  "day3": { ... same structure ... },
  "day4": { ... same structure ... },
  "day5": { ... same structure ... },
  "day6": { ... same structure ... },
  "day7": { ... same structure ... }
}

CRITICAL REQUIREMENTS: 
- Total calories per day MUST equal ${targetCalories} (±50 calories)
- STRICTLY AVOID all listed restrictions
- Return ONLY valid JSON`;

        console.log('🤖 Sending prompt to AI...');
        const result = await model.generateContent(mealPrompt);
        const response = await result.response;
        const text = response.text();
        console.log('✅ Response received (length: ' + text.length + ')');

        // Try parsing
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            console.log('✅ JSON Parsed successfully');
            console.log('Days generated:', Object.keys(json));
        } else {
            console.error('❌ Failed to extract JSON');
            console.log('Raw text:', text.substring(0, 500));
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testGen();
