/**
 * Goal Analyzer
 * 
 * Analyzes user's initial goal statement to extract key information
 * and identify what needs clarification.
 */

const { validateGoal } = require('../utils/validators');
const { getLogger } = require('../utils/logger');

const logger = getLogger();

class GoalAnalyzer {
    constructor(watsonxClient) {
        this.watsonxClient = watsonxClient;
    }

    /**
     * Main analysis function
     */
    async analyze(goalText) {
        logger.section('Analyzing Goal');

        // Validate goal
        const validation = validateGoal(goalText);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const goal = validation.value;
        logger.info(`Goal: "${goal.substring(0, 100)}${goal.length > 100 ? '...' : ''}"`);

        // Extract basic information
        logger.progress('Extracting information');
        const extractedInfo = this.extractInformation(goal);
        logger.progressDone();

        // Use AI to analyze the goal
        logger.progress('Analyzing with AI');
        let aiAnalysis;
        try {
            aiAnalysis = await this.watsonxClient.analyzeGoal(goal);
        } catch (error) {
            logger.warn('AI analysis failed, using fallback analysis');
            aiAnalysis = this.fallbackAnalysis(goal, extractedInfo);
        }
        logger.progressDone();

        // Combine extracted info with AI analysis
        const analysis = {
            goal,
            intent: aiAnalysis.intent || goal,
            domain: aiAnalysis.domain || this.detectDomain(goal),
            complexity: aiAnalysis.complexity || this.assessComplexity(goal, extractedInfo),
            extractedInfo: {
                users: [...new Set([...extractedInfo.users, ...(aiAnalysis.extractedInfo?.users || [])])],
                features: [...new Set([...extractedInfo.features, ...(aiAnalysis.extractedInfo?.features || [])])],
                constraints: [...new Set([...extractedInfo.constraints, ...(aiAnalysis.extractedInfo?.constraints || [])])]
            },
            ambiguities: aiAnalysis.ambiguities || this.identifyGaps(extractedInfo),
            suggestedQuestions: aiAnalysis.suggestedQuestions || []
        };

        logger.success('Goal analysis complete');
        logger.debug('Analysis result', analysis);

        return analysis;
    }

    /**
     * Extract structured information from goal text
     */
    extractInformation(goalText) {
        const text = goalText.toLowerCase();
        const info = {
            users: [],
            features: [],
            constraints: []
        };

        // Extract user mentions
        const userKeywords = ['user', 'customer', 'client', 'admin', 'manager', 'employee', 'visitor', 'member'];
        userKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                info.users.push(keyword);
            }
        });

        // Extract feature mentions
        const featureKeywords = [
            'login', 'authentication', 'register', 'signup',
            'search', 'filter', 'sort',
            'create', 'edit', 'delete', 'update',
            'upload', 'download',
            'payment', 'checkout', 'cart',
            'notification', 'alert', 'email',
            'dashboard', 'report', 'analytics',
            'chat', 'message', 'comment'
        ];
        featureKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                info.features.push(keyword);
            }
        });

        // Extract constraints
        const constraintKeywords = [
            { keyword: 'web', type: 'platform' },
            { keyword: 'mobile', type: 'platform' },
            { keyword: 'ios', type: 'platform' },
            { keyword: 'android', type: 'platform' },
            { keyword: 'desktop', type: 'platform' },
            { keyword: 'responsive', type: 'design' },
            { keyword: 'real-time', type: 'performance' },
            { keyword: 'secure', type: 'security' },
            { keyword: 'fast', type: 'performance' },
            { keyword: 'scalable', type: 'architecture' }
        ];
        constraintKeywords.forEach(({ keyword, type }) => {
            if (text.includes(keyword)) {
                info.constraints.push(`${type}: ${keyword}`);
            }
        });

        return info;
    }

    /**
     * Detect software domain
     */
    detectDomain(goalText) {
        const text = goalText.toLowerCase();

        if (text.match(/\b(web|website|webapp|browser)\b/)) return 'web';
        if (text.match(/\b(mobile|app|ios|android)\b/)) return 'mobile';
        if (text.match(/\b(api|rest|graphql|endpoint)\b/)) return 'api';
        if (text.match(/\b(desktop|electron|native)\b/)) return 'desktop';
        if (text.match(/\b(cli|command|terminal)\b/)) return 'cli';
        if (text.match(/\b(game|gaming)\b/)) return 'game';
        if (text.match(/\b(iot|embedded|device)\b/)) return 'iot';
        if (text.match(/\b(ml|ai|machine learning|data science)\b/)) return 'ml';

        return 'general';
    }

    /**
     * Assess complexity level
     */
    assessComplexity(goalText, extractedInfo) {
        let score = 0;

        // Length factor
        if (goalText.length > 500) score += 2;
        else if (goalText.length > 200) score += 1;

        // Feature count
        if (extractedInfo.features.length > 5) score += 2;
        else if (extractedInfo.features.length > 2) score += 1;

        // User types
        if (extractedInfo.users.length > 2) score += 1;

        // Constraints
        if (extractedInfo.constraints.length > 3) score += 1;

        // Keywords indicating complexity
        const complexKeywords = [
            'integration', 'scalable', 'distributed', 'microservice',
            'real-time', 'analytics', 'machine learning', 'ai',
            'multi-tenant', 'enterprise', 'workflow', 'automation'
        ];
        const text = goalText.toLowerCase();
        complexKeywords.forEach(keyword => {
            if (text.includes(keyword)) score += 1;
        });

        if (score >= 5) return 'complex';
        if (score >= 2) return 'moderate';
        return 'simple';
    }

    /**
     * Identify information gaps
     */
    identifyGaps(extractedInfo) {
        const gaps = [];

        if (extractedInfo.users.length === 0) {
            gaps.push('Target users not specified');
        }

        if (extractedInfo.features.length === 0) {
            gaps.push('Core features not clearly defined');
        }

        if (extractedInfo.constraints.length === 0) {
            gaps.push('Technical constraints not mentioned');
        }

        // Always add these common gaps
        gaps.push('Success criteria not defined');
        gaps.push('Deployment model not specified');
        gaps.push('Data requirements unclear');

        return gaps;
    }

    /**
     * Fallback analysis when AI is unavailable
     */
    fallbackAnalysis(goal, extractedInfo) {
        return {
            intent: goal,
            domain: this.detectDomain(goal),
            complexity: this.assessComplexity(goal, extractedInfo),
            extractedInfo,
            ambiguities: this.identifyGaps(extractedInfo),
            suggestedQuestions: this.generateFallbackQuestions(extractedInfo)
        };
    }

    /**
     * Generate fallback questions
     */
    generateFallbackQuestions(extractedInfo) {
        const questions = [
            'Who are the primary users of this application?',
            'How will users access this application?',
            'What are the top 3 most important features?'
        ];

        if (extractedInfo.users.length === 0) {
            questions.push('What user roles should the system support?');
        }

        if (extractedInfo.constraints.length === 0) {
            questions.push('Are there any technical constraints or requirements?');
        }

        return questions;
    }

    /**
     * Prioritize questions based on analysis
     */
    prioritizeQuestions(gaps) {
        const priorities = {
            'Target users not specified': 1,
            'Core features not clearly defined': 1,
            'Success criteria not defined': 1,
            'Deployment model not specified': 2,
            'Technical constraints not mentioned': 2,
            'Data requirements unclear': 2
        };

        return gaps.map(gap => ({
            gap,
            priority: priorities[gap] || 3
        })).sort((a, b) => a.priority - b.priority);
    }
}

module.exports = GoalAnalyzer;

// Made with Bob
