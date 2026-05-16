/**
 * WatsonX AI Client
 * 
 * Wrapper for IBM watsonx.ai SDK with error handling and retry logic.
 */

const { getLogger } = require('../utils/logger');
const logger = getLogger();

class WatsonXClient {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.initialized = false;
        this.mockMode = false;
    }

    /**
     * Initialize the watsonx.ai client
     */
    async initialize() {
        try {
            logger.debug('Initializing watsonx.ai client...');

            // Check if credentials are provided
            if (!this.config.watsonx.apiKey || !this.config.watsonx.projectId) {
                logger.debug('API credentials not configured, using mock mode');
                this.initialized = true;
                this.mockMode = true;
                return true;
            }

            // Import the SDK dynamically
            const { WatsonXAI } = require('@ibm-cloud/watsonx-ai');

            // Set environment variables for SDK authentication
            process.env.WATSONX_AI_AUTH_TYPE = 'iam';
            process.env.WATSONX_AI_APIKEY = this.config.watsonx.apiKey;

            // Create client instance using newInstance (reads from env vars)
            this.client = WatsonXAI.newInstance({
                version: '2024-05-31',
                serviceUrl: `https://${this.config.watsonx.region}.ml.cloud.ibm.com`,
            });

            this.projectId = this.config.watsonx.projectId;
            this.initialized = true;
            this.mockMode = false;
            logger.debug('WatsonX client initialized successfully');

            return true;
        } catch (error) {
            logger.debug(`Failed to initialize watsonx.ai SDK: ${error.message}, falling back to mock mode`);
            this.initialized = true;
            this.mockMode = true;
            return true;
        }
    }

    /**
     * Generate text using watsonx.ai
     */
    async generateText(prompt, options = {}) {
        if (!this.initialized) {
            await this.initialize();
        }

        // Use mock mode if not connected to real API
        if (this.mockMode) {
            logger.debug('Using mock mode for text generation');
            const mockParams = {
                model_id: options.model || this.config.watsonx.model,
                input: prompt,
            };
            const response = await this.mockGenerateText(mockParams);
            return response.results[0].generated_text;
        }

        // Real API call using textChat
        const params = {
            messages: [{ role: 'user', content: prompt }],
            modelId: options.model || this.config.watsonx.model,
            projectId: this.projectId,
            maxTokens: options.maxTokens || this.config.watsonx.maxTokens,
            temperature: options.temperature || this.config.watsonx.temperature,
            topP: options.topP || 0.9,
            // Note: topK and repetitionPenalty are not supported in textChat API
        };

        logger.trace('Sending request to watsonx.ai', {
            model: params.modelId,
            promptLength: prompt.length
        });

        try {
            const response = await this.withRetry(async () => {
                return await this.client.textChat(params);
            });

            const generatedText = response.result.choices[0].message?.content || '';

            logger.trace('Received response from watsonx.ai', {
                responseLength: generatedText.length
            });

            return generatedText;
        } catch (error) {
            logger.error('Failed to generate text');
            logger.debug('API Error details:', error);
            throw this.handleAPIError(error);
        }
    }

    /**
     * Mock generate text for development
     * This will be replaced with actual SDK call
     */
    async mockGenerateText(params) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Return mock response based on input
        const input = params.input.toLowerCase();

        if (input.includes('analyze') && input.includes('goal')) {
            return {
                results: [{
                    generated_text: JSON.stringify({
                        intent: 'Build a software application',
                        domain: 'web',
                        complexity: 'moderate',
                        extractedInfo: {
                            users: ['end users', 'administrators'],
                            features: ['user authentication', 'data management'],
                            constraints: ['web-based', 'responsive design']
                        },
                        ambiguities: [
                            'What is the target user base size?',
                            'What are the specific data types to manage?',
                            'Are there any integration requirements?'
                        ],
                        suggestedQuestions: [
                            'Who are the primary users of this application?',
                            'What platforms should it support?',
                            'What are the key success metrics?'
                        ]
                    }, null, 2)
                }]
            };
        }

        if (input.includes('generate') && input.includes('questions')) {
            return {
                results: [{
                    generated_text: JSON.stringify([
                        {
                            id: 'q1',
                            category: 'User & Audience',
                            text: 'Who are the primary users of this application?',
                            priority: 1,
                            suggestedAnswers: ['General public', 'Business users', 'Internal team']
                        },
                        {
                            id: 'q2',
                            category: 'Access & Deployment',
                            text: 'How will users access this application?',
                            priority: 2,
                            suggestedAnswers: ['Web browser', 'Mobile app', 'Desktop application']
                        },
                        {
                            id: 'q3',
                            category: 'Core Functionality',
                            text: 'What are the top 3 most important features?',
                            priority: 1,
                            suggestedAnswers: []
                        }
                    ], null, 2)
                }]
            };
        }

        // Default response for spec generation
        return {
            results: [{
                generated_text: `# Generated Content

This is a placeholder response from the mock watsonx.ai client.
In production, this would contain the actual AI-generated content based on the prompt.

The content would be formatted according to the section being generated and would include:
- Detailed analysis
- Structured information
- Actionable recommendations
- Clear formatting

This mock response helps with development and testing without requiring actual API calls.`
            }]
        };
    }

    /**
     * Analyze a goal statement
     */
    async analyzeGoal(goalText) {
        const prompt = `Analyze this software goal and provide a structured analysis.

Goal: "${goalText}"

Provide a JSON response with:
1. intent - What the user wants to achieve
2. domain - Software domain (web, mobile, api, desktop, etc.)
3. complexity - simple, moderate, or complex
4. extractedInfo - Object with arrays: users, features, constraints
5. ambiguities - Array of things that need clarification
6. suggestedQuestions - Array of questions to ask

Format your response as valid JSON only, no additional text.`;

        const response = await this.generateText(prompt, {
            temperature: 0.3,
            maxTokens: 800
        });

        try {
            return JSON.parse(response);
        } catch (error) {
            logger.warn('Failed to parse goal analysis response, using fallback');
            return {
                intent: goalText,
                domain: 'general',
                complexity: 'moderate',
                extractedInfo: { users: [], features: [], constraints: [] },
                ambiguities: [],
                suggestedQuestions: []
            };
        }
    }

    /**
     * Generate clarifying questions
     */
    async generateQuestions(context) {
        const prompt = `Based on this context, generate 3-5 clarifying questions to create a complete specification.

Context:
${JSON.stringify(context, null, 2)}

Generate questions about:
- User roles and personas
- Access methods and deployment
- Success criteria and metrics
- Technical constraints
- Priority features

Format your response as a JSON array of question objects with:
- id: unique identifier
- category: question category
- text: the question text
- priority: 1 (high) or 2 (medium)
- suggestedAnswers: array of suggested answers (optional)

Return only valid JSON, no additional text.`;

        const response = await this.generateText(prompt, {
            temperature: 0.5,
            maxTokens: 1000
        });

        try {
            return JSON.parse(response);
        } catch (error) {
            logger.warn('Failed to parse questions response, using fallback');
            return [];
        }
    }

    /**
     * Generate a specification section
     */
    async generateSection(sectionName, context) {
        const prompt = `Generate the "${sectionName}" section for a software specification.

Context:
${JSON.stringify(context, null, 2)}

Requirements:
- Format as markdown
- Be specific and actionable
- Include all relevant details
- Use proper markdown formatting (headers, lists, tables, etc.)
- Make it ready for a developer to implement

Generate comprehensive content for this section.`;

        return await this.generateText(prompt, {
            temperature: 0.4,
            maxTokens: 2000
        });
    }

    /**
     * Retry logic for API calls
     */
    async withRetry(fn, maxRetries = 3) {
        let lastError;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
                    logger.warn(`API call failed (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw lastError;
    }

    /**
     * Handle API errors
     */
    handleAPIError(error) {
        if (error.status === 401 || error.status === 403) {
            const authError = new Error('Authentication failed. Please check your API key and project ID.');
            authError.name = 'AuthenticationError';
            return authError;
        }

        if (error.status === 429) {
            const rateLimitError = new Error('API rate limit exceeded. Please try again later.');
            rateLimitError.name = 'RateLimitError';
            return rateLimitError;
        }

        if (error.status >= 500) {
            const serverError = new Error('watsonx.ai service is temporarily unavailable. Please try again later.');
            serverError.name = 'ServiceError';
            return serverError;
        }

        const apiError = new Error(`API error: ${error.message}`);
        apiError.name = 'APIError';
        return apiError;
    }

    /**
     * Check if client is ready
     */
    isReady() {
        return this.initialized;
    }
}

module.exports = WatsonXClient;

// Made with Bob
