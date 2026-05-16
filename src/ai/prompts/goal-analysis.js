/**
 * Goal Analysis Prompts
 * 
 * Prompts for analyzing user's initial software goal.
 */

/**
 * Main goal analysis prompt
 */
const GOAL_ANALYSIS_PROMPT = `Analyze this software goal and provide a structured analysis.

Goal: "{goal}"

Provide a JSON response with:
1. intent - What the user wants to achieve (clear, concise statement)
2. domain - Software domain (web, mobile, api, desktop, cli, game, iot, ml, or general)
3. complexity - Assessment: simple, moderate, or complex
4. extractedInfo - Object with arrays:
   - users: Array of user types mentioned
   - features: Array of features mentioned
   - constraints: Array of constraints mentioned
5. ambiguities - Array of things that need clarification
6. suggestedQuestions - Array of at least 3 initial questions to ask

Format your response as valid JSON only, no additional text.

Example response format:
{
  "intent": "Build a mobile application for coffee shop ordering",
  "domain": "mobile",
  "complexity": "moderate",
  "extractedInfo": {
    "users": ["customers", "baristas"],
    "features": ["mobile ordering", "rewards program"],
    "constraints": ["mobile-first", "real-time updates"]
  },
  "ambiguities": [
    "Target user base size not specified",
    "Payment integration requirements unclear"
  ],
  "suggestedQuestions": [
    "Who are the primary users?",
    "What platforms should it support?",
    "What are the key success metrics?"
  ]
}`;

/**
 * Get goal analysis prompt with context
 */
function getGoalAnalysisPrompt(goal) {
    return GOAL_ANALYSIS_PROMPT.replace('{goal}', goal);
}

/**
 * Prompt configuration for goal analysis
 */
const GOAL_ANALYSIS_CONFIG = {
    temperature: 0.3,
    maxTokens: 4000,
    topP: 0.9,
    topK: 50
};

module.exports = {
    GOAL_ANALYSIS_PROMPT,
    getGoalAnalysisPrompt,
    GOAL_ANALYSIS_CONFIG
};

// Made with Bob
