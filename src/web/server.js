/**
 * SpecBaker Web Server
 * 
 * Express server for the web interface
 */

const express = require('express');
const path = require('path');
const { getConfigManager } = require('../config/config-manager');
const { setLogger } = require('../utils/logger');
const WatsonXClient = require('../ai/watsonx-client');
const GoalAnalyzer = require('../analyzer/goal-analyzer');
const QuestionGenerator = require('../generator/question-generator');
const { generateDeveloperQuestions } = require('../generator/developer-questions');
const SpecEngine = require('../generator/spec-engine');
const MarkdownFormatter = require('../formatter/markdown-formatter');
const { getSessionManager } = require('./session-manager');

class SpecBakerServer {
    constructor(port = 3000) {
        this.port = port;
        this.app = express();
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Parse JSON bodies
        this.app.use(express.json());

        // Serve static files from public directory
        this.app.use(express.static(path.join(__dirname, '../../public')));

        // CORS for development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/api/health', (req, res) => {
            res.json({ status: 'ok', version: '1.0.0' });
        });

        // Analyze goal and generate questions (like CLI lines 70-76)
        this.app.post('/api/analyze', async (req, res) => {
            try {
                const { goal } = req.body;

                if (!goal) {
                    return res.status(400).json({ error: 'Goal is required' });
                }

                // Initialize components
                const config = this.loadConfig();
                const watsonxClient = new WatsonXClient(config);
                const goalAnalyzer = new GoalAnalyzer(watsonxClient);
                const questionGenerator = new QuestionGenerator(watsonxClient, config);

                // Analyze goal
                const analysis = await goalAnalyzer.analyze(goal);

                // Create session and initialize context (like CLI line 72)
                const sessionManager = getSessionManager();
                const sessionId = sessionManager.createSession(goal, analysis);
                const contextBuilder = sessionManager.getContextBuilder(sessionId);

                // Generate questions
                const questionsResponse = await questionGenerator.generateInitialQuestions(analysis);
                const questions = questionsResponse.questions || questionsResponse;

                // Add questions to context (like CLI line 76)
                contextBuilder.addQuestions(questions);

                res.json({
                    sessionId,
                    analysis,
                    questions: questions.slice(0, 10) // Limit to 10 questions for web
                });

            } catch (error) {
                console.error('Error in /api/analyze:', error);
                res.status(500).json({
                    error: 'Failed to analyze goal',
                    message: error.message
                });
            }
        });

        // Add answers to session context (like CLI lines 86-88, 186-188)
        this.app.post('/api/add-answers', async (req, res) => {
            try {
                const { sessionId, answers, questions } = req.body;

                if (!sessionId || !answers) {
                    return res.status(400).json({ error: 'Session ID and answers are required' });
                }

                // Get session context
                const sessionManager = getSessionManager();
                const contextBuilder = sessionManager.getContextBuilder(sessionId);

                if (!contextBuilder) {
                    return res.status(404).json({ error: 'Session not found or expired' });
                }

                // Add questions to context if provided (like CLI line 178)
                if (questions && Array.isArray(questions)) {
                    contextBuilder.addQuestions(questions);
                }

                // Add answers to context (like CLI lines 86-88, 186-188)
                for (const [questionId, answer] of Object.entries(answers)) {
                    contextBuilder.addAnswer(questionId, answer);
                }

                res.json({ success: true });

            } catch (error) {
                console.error('Error in /api/add-answers:', error);
                res.status(500).json({
                    error: 'Failed to add answers',
                    message: error.message
                });
            }
        });

        // Generate follow-up questions (following CLI pattern lines 103-194)
        this.app.post('/api/followup', async (req, res) => {
            try {
                const { sessionId, round } = req.body;

                if (!sessionId) {
                    return res.status(400).json({ error: 'Session ID is required' });
                }

                // Get session context (like CLI uses single contextBuilder)
                const sessionManager = getSessionManager();
                const contextBuilder = sessionManager.getContextBuilder(sessionId);

                if (!contextBuilder) {
                    return res.status(404).json({ error: 'Session not found or expired' });
                }

                // Initialize components
                const config = this.loadConfig();
                const watsonxClient = new WatsonXClient(config);
                const questionGenerator = new QuestionGenerator(watsonxClient, config);

                // Get questions and answers from context (like CLI line 108)
                const allAnswersWithQuestion = contextBuilder.getQuestionsAndAnswers();

                // Generate follow-up questions with confidence scoring (like CLI lines 111-115)
                const followUpResult = await questionGenerator.generateFollowUpRound(
                    contextBuilder.getContext(),
                    allAnswersWithQuestion,
                    round || 1
                );

                const followUpQuestions = followUpResult.questions || [];
                const followUpSummary = followUpResult.summary || '';
                const confidenceScore = followUpResult.confidenceScore || 0;
                const confidenceReason = followUpResult.confidenceReason || '';
                const roundType = followUpResult.roundType || '';
                const whatYouKnow = followUpResult.whatYouKnow || '';

                // Return all confidence data
                res.json({
                    questions: followUpQuestions,
                    summary: followUpSummary,
                    confidenceScore,
                    confidenceReason,
                    roundType,
                    whatYouKnow
                });

            } catch (error) {
                console.error('Error in /api/followup:', error);
                res.status(500).json({
                    error: 'Failed to generate follow-up questions',
                    message: error.message
                });
            }
        });

        // Generate developer/technical questions (like CLI lines 199-201)
        this.app.post('/api/developer-questions', async (req, res) => {
            try {
                const { sessionId } = req.body;

                if (!sessionId) {
                    return res.status(400).json({ error: 'Session ID is required' });
                }

                // Get session context
                const sessionManager = getSessionManager();
                const session = sessionManager.getSession(sessionId);

                if (!session) {
                    return res.status(404).json({ error: 'Session not found or expired' });
                }

                // Get analysis from context
                const context = session.contextBuilder.getContext();
                const questions = generateDeveloperQuestions(context.analysis);

                res.json({ questions });

            } catch (error) {
                console.error('Error in /api/developer-questions:', error);
                res.status(500).json({
                    error: 'Failed to generate developer questions',
                    message: error.message
                });
            }
        });

        // Generate specification (like CLI lines 235-278)
        this.app.post('/api/generate', async (req, res) => {
            try {
                const { sessionId } = req.body;

                if (!sessionId) {
                    return res.status(400).json({ error: 'Session ID is required' });
                }

                // Get session context
                const sessionManager = getSessionManager();
                const contextBuilder = sessionManager.getContextBuilder(sessionId);

                if (!contextBuilder) {
                    return res.status(404).json({ error: 'Session not found or expired' });
                }

                // Set up SSE
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');

                const sendProgress = (message, progress) => {
                    res.write(`data: ${JSON.stringify({ type: 'progress', message, progress })}\n\n`);
                };

                // Initialize components
                const config = this.loadConfig();
                const watsonxClient = new WatsonXClient(config);
                const formatter = new MarkdownFormatter(config);

                sendProgress('Generating specification sections...', 30);

                // Generate specification (like CLI line 237-238)
                const specEngine = new SpecEngine(watsonxClient, contextBuilder);

                // Custom progress tracking
                const originalGenerateSection = specEngine.generateSection.bind(specEngine);
                let sectionCount = 0;
                const totalSections = 10;

                specEngine.generateSection = async function (sectionName, contextData) {
                    sendProgress(`Generating ${sectionName}...`, 30 + (sectionCount / totalSections) * 60);
                    const result = await originalGenerateSection(sectionName, contextData);
                    sectionCount++;
                    return result;
                };

                const spec = await specEngine.generateSpec();

                sendProgress('Formatting specification...', 95);

                // Format as markdown (like CLI lines 242-243)
                const markdown = formatter.format(spec, contextBuilder.getContext());
                const normalized = formatter.normalize(markdown);

                // Calculate statistics (like CLI lines 268-269)
                const wordCount = formatter.getWordCount(normalized);
                const readingTime = formatter.getReadingTime(normalized);
                const fileSize = (normalized.length / 1024).toFixed(2);

                sendProgress('Complete!', 100);

                // Send final result
                res.write(`data: ${JSON.stringify({
                    type: 'complete',
                    specification: spec,
                    markdown: normalized,
                    stats: {
                        sections: Object.keys(spec.sections).length,
                        wordCount,
                        readingTime,
                        fileSize
                    }
                })}\n\n`);

                res.end();

                // Clean up session after generation
                sessionManager.deleteSession(sessionId);

            } catch (error) {
                console.error('Error in /api/generate:', error);
                res.write(`data: ${JSON.stringify({
                    type: 'error',
                    message: error.message
                })}\n\n`);
                res.end();
            }
        });

        // Serve index.html for all other routes (SPA)
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../public/index.html'));
        });
    }

    loadConfig() {
        try {
            const configManager = getConfigManager();
            const config = configManager.load();

            // Set up logger for web mode (less verbose)
            setLogger({
                verbose: false,
                debug: false
            });

            return config;
        } catch (error) {
            console.error('Failed to load configuration:', error.message);
            throw new Error('Configuration not set up. Please run: specbaker config setup');
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log('');
            console.log('🥖 SpecBaker Web Interface');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✓ Server running at http://localhost:${this.port}`);
            console.log(`✓ Open your browser and start generating specifications!`);
            console.log('');
            console.log('Press Ctrl+C to stop the server');
            console.log('');
        });
    }
}

// Export for use in other modules
module.exports = SpecBakerServer;

// Run server if executed directly
if (require.main === module) {
    const port = process.env.PORT || 3000;
    const server = new SpecBakerServer(port);
    server.start();
}

// Made with Bob
