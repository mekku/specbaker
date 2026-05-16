/**
 * Question Generation Prompts
 * 
 * Prompts for generating clarifying questions based on goal analysis.
 */

/**
 * Main question generation prompt
 */
const QUESTION_GENERATION_PROMPT = `Based on this context, generate 3-5 clarifying questions to create a complete specification.

Context:
{context}

Generate questions about:
- User roles and personas
- Access methods and deployment
- Success criteria and metrics
- Technical constraints
- Priority features

Format your response as a JSON array of question objects with:
- id: unique identifier (e.g., "q1", "q2")
- category: question category (User & Audience, Access & Deployment, Core Functionality, Success Criteria, Constraints, Priority)
- text: the question text
- priority: 1 (high) or 2 (medium)
- allowMultiple: true if multiple answers are expected, false otherwise
- suggestedAnswers: array of suggested answers (optional, can be empty array)

Return only valid JSON array, no additional text.

Example response format:
[
  {
    "id": "q1",
    "category": "User & Audience",
    "text": "Who are the primary users of this application?",
    "priority": 1,
    "allowMultiple": true,
    "suggestedAnswers": ["General public", "Business users", "Internal team"]
  },
  {
    "id": "q2",
    "category": "Core Functionality",
    "text": "What are the top 3 most important features?",
    "priority": 1,
    "allowMultiple": false,
    "suggestedAnswers": []
  }
]`;

/**
 * Get question generation prompt with context
 */
function getQuestionGenerationPrompt(context) {
    return QUESTION_GENERATION_PROMPT.replace('{context}', JSON.stringify(context, null, 2));
}

/**
 * Prompt configuration for question generation
 */
const QUESTION_GENERATION_CONFIG = {
    temperature: 0.5,
    maxTokens: 1000,
    topP: 0.9,
    topK: 50
};

module.exports = {
    QUESTION_GENERATION_PROMPT,
    getQuestionGenerationPrompt,
    QUESTION_GENERATION_CONFIG
};

// Made with Bob
