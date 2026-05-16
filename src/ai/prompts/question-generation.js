/**
 * Question Generation Prompts
 * 
 * Prompts for generating clarifying questions based on goal analysis.
 */

/**
 * Main question generation prompt
 */
const QUESTION_GENERATION_PROMPT = `You are an expert Systems Analyst conducting a requirements gathering session. Based on this context, generate clarifying questions to create a complete specification.

Context:
{context}

IMPORTANT - PRIORITY GUIDELINES:
**Priority is CRITICAL for question ordering. Assign priority carefully:**

Priority 1 (HIGH/CRITICAL) - Ask these FIRST:
- Core functionality and main features
- Primary users and target audience
- Main problem being solved
- Essential business goals
- Critical technical constraints

Priority 2 (MEDIUM/IMPORTANT) - Ask these SECOND:
- Specific feature details
- Integration requirements
- Performance expectations
- Security and compliance needs
- User experience details

Priority 3 (LOW/NICE-TO-HAVE) - Ask these LAST:
- Optional features
- Future enhancements
- Analytics and reporting
- Edge cases
- Minor optimizations

Generate questions about:
- User roles and personas (Priority 1)
- Core functionality (Priority 1)
- Access methods and deployment (Priority 2)
- Success criteria and metrics (Priority 2)
- Technical constraints (Priority 1-2)
- Priority features (Priority 1)
- Integration needs (Priority 2)
- Security requirements (Priority 2)
- Nice-to-have features (Priority 3)

Format your response as a JSON array of question objects with:
- id: unique identifier (e.g., "q1", "q2")
- category: question category (User & Audience, Access & Deployment, Core Functionality, Success Criteria, Constraints, Priority)
- text: the question text
- priority: 1 (high/critical), 2 (medium/important), or 3 (low/nice-to-have)
- allowMultiple: true if multiple answers are expected (e.g., "top 3 features", "which platforms"), false otherwise
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
    "allowMultiple": true,
    "suggestedAnswers": []
  },
  {
    "id": "q3",
    "category": "Integration",
    "text": "What third-party services need to be integrated?",
    "priority": 2,
    "allowMultiple": true,
    "suggestedAnswers": []
  }
]

Generate 5-8 questions focusing on priority 1 questions first.`;

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
