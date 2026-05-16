/**
 * Context Builder
 * 
 * Accumulates information from user responses and maintains conversation state.
 */

const fs = require('fs');
const { getLogger } = require('../utils/logger');

const logger = getLogger();

class ContextBuilder {
    constructor() {
        this.context = {
            goal: null,
            analysis: null,
            questions: [],
            answers: new Map(),
            decisions: [],
            metadata: {
                startTime: new Date(),
                lastUpdated: new Date(),
                version: '1.0.0'
            }
        };
    }

    /**
     * Initialize context with goal and analysis
     */
    initialize(goal, analysis) {
        this.context.goal = goal;
        this.context.analysis = analysis;
        this.context.metadata.startTime = new Date();
        this.context.metadata.lastUpdated = new Date();

        logger.debug('Context initialized', {
            goal: goal.substring(0, 50) + '...',
            complexity: analysis.complexity
        });
    }

    /**
     * Add a question to the context
     */
    addQuestion(question) {
        this.context.questions.push(question);
        this.context.metadata.lastUpdated = new Date();
    }

    /**
     * Add multiple questions
     */
    addQuestions(questions) {
        this.context.questions.push(...questions);
        this.context.metadata.lastUpdated = new Date();
    }

    /**
     * Add an answer to a question
     */
    addAnswer(questionId, answer) {
        this.context.answers.set(questionId, {
            answer,
            timestamp: new Date()
        });
        this.context.metadata.lastUpdated = new Date();

        logger.debug(`Answer added for question ${questionId}`);
    }

    /**
     * Get an answer by question ID
     */
    getAnswer(questionId) {
        const answerData = this.context.answers.get(questionId);
        return answerData ? answerData.answer : null;
    }

    /**
     * Get all answers
     */
    getAllAnswers() {
        const answers = {};
        for (const [questionId, data] of this.context.answers.entries()) {
            answers[questionId] = data.answer;
        }
        return answers;
    }

    /**
     * Get all questions and answers as json array
     */
    getQuestionsAndAnswers() {
        const questionsAndAnswers = [];
        for (const question of this.context.questions) {
            const answerData = this.context.answers.get(question.id);
            const answer = answerData ? answerData.answer : "-";
            logger.debug(`Answer for question ${question.text}: ${answer}`);
            questionsAndAnswers.push({
                qid: question.id,
                question: question.text,
                answer: this.getAnswer(question.id)
            });
        }
        return questionsAndAnswers;
    }


    /**
     * Record a decision
     */
    addDecision(decision) {
        this.context.decisions.push({
            ...decision,
            timestamp: new Date()
        });
        this.context.metadata.lastUpdated = new Date();

        logger.debug('Decision recorded', decision);
    }

    /**
     * Get the full context
     */
    getContext() {
        return {
            ...this.context,
            answers: this.getAllAnswers()
        };
    }

    /**
     * Get a formatted context for AI prompts
     */
    getFormattedContext() {
        const answers = this.getAllAnswers();
        const questionAnswerPairs = this.context.questions
            .filter(q => answers[q.id])
            .map(q => ({
                question: q.text,
                category: q.category,
                answer: answers[q.id]
            }));

        return {
            goal: this.context.goal,
            analysis: this.context.analysis,
            questionAnswers: questionAnswerPairs,
            decisions: this.context.decisions,
            metadata: this.context.metadata
        };
    }

    /**
     * Get context summary for display
     */
    getSummary() {
        const totalQuestions = this.context.questions.length;
        const answeredQuestions = this.context.answers.size;
        const decisions = this.context.decisions.length;

        return {
            goal: this.context.goal,
            complexity: this.context.analysis?.complexity || 'unknown',
            totalQuestions,
            answeredQuestions,
            decisions,
            completeness: totalQuestions > 0 ? (answeredQuestions / totalQuestions * 100).toFixed(0) : 0
        };
    }

    /**
     * Check if context is complete
     */
    isComplete() {
        // Context is complete if we have:
        // 1. A goal
        // 2. An analysis
        // 3. At least some answers
        return (
            this.context.goal &&
            this.context.analysis &&
            this.context.answers.size > 0
        );
    }

    /**
     * Get unanswered questions
     */
    getUnansweredQuestions() {
        return this.context.questions.filter(q => !this.context.answers.has(q.id));
    }

    /**
     * Get answered questions
     */
    getAnsweredQuestions() {
        return this.context.questions.filter(q => this.context.answers.has(q.id));
    }

    /**
     * Save context to file
     */
    save(filepath) {
        try {
            const data = {
                ...this.context,
                answers: Array.from(this.context.answers.entries())
            };

            fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
            logger.success(`Context saved to ${filepath}`);
            return true;
        } catch (error) {
            logger.error(`Failed to save context: ${error.message}`);
            return false;
        }
    }

    /**
     * Load context from file
     */
    static load(filepath) {
        try {
            const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

            const builder = new ContextBuilder();
            builder.context = {
                ...data,
                answers: new Map(data.answers)
            };

            logger.success(`Context loaded from ${filepath}`);
            return builder;
        } catch (error) {
            logger.error(`Failed to load context: ${error.message}`);
            throw error;
        }
    }

    /**
     * Reset context
     */
    reset() {
        this.context = {
            goal: null,
            analysis: null,
            questions: [],
            answers: new Map(),
            decisions: [],
            metadata: {
                startTime: new Date(),
                lastUpdated: new Date(),
                version: '1.0.0'
            }
        };
    }

    /**
     * Export context for spec generation
     */
    exportForSpecGeneration() {
        const answers = this.getAllAnswers();

        // Organize answers by category
        const answersByCategory = {};
        for (const question of this.context.questions) {
            if (answers[question.id]) {
                if (!answersByCategory[question.category]) {
                    answersByCategory[question.category] = [];
                }
                answersByCategory[question.category].push({
                    question: question.text,
                    answer: answers[question.id]
                });
            }
        }

        return {
            goal: this.context.goal,
            analysis: this.context.analysis,
            answersByCategory,
            allAnswers: answers,
            decisions: this.context.decisions,
            summary: this.getSummary()
        };
    }
}

module.exports = ContextBuilder;

// Made with Bob
