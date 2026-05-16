/**
 * Generate Command
 * 
 * Main command to generate specifications from user goals.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { getConfigManager } = require('../../config/config-manager');
const { getLogger, setLogger } = require('../../utils/logger');
const WatsonXClient = require('../../ai/watsonx-client');
const GoalAnalyzer = require('../../analyzer/goal-analyzer');
const QuestionGenerator = require('../../generator/question-generator');
const { generateDeveloperQuestions, shouldAskDeveloperQuestions } = require('../../generator/developer-questions');
const InteractivePrompter = require('../../prompts/interactive-prompter');
const ContextBuilder = require('../../context/context-builder');
const SpecEngine = require('../../generator/spec-engine');
const MarkdownFormatter = require('../../formatter/markdown-formatter');

/**
 * Generate command handler
 */
async function generateCommand(goal, options) {
    try {
        // Set up logger with options
        const logger = setLogger({
            verbose: options.verbose,
            debug: options.debug
        });

        // Load configuration
        const configManager = getConfigManager();
        const config = configManager.load(options);

        // Validate configuration
        try {
            configManager.validate();
        } catch (error) {
            logger.error('Configuration validation failed');
            console.error(chalk.red('\nPlease run: ') + chalk.cyan('specbaker config setup'));
            process.exit(1);
        }

        // Initialize components
        const watsonxClient = new WatsonXClient(config);
        const goalAnalyzer = new GoalAnalyzer(watsonxClient);
        const questionGenerator = new QuestionGenerator(watsonxClient, config);
        const prompter = new InteractivePrompter(config);
        const contextBuilder = new ContextBuilder();
        const formatter = new MarkdownFormatter(config);

        // Show welcome message
        if (options.interactive !== false) {
            prompter.showWelcome();
        }

        // Get goal if not provided
        if (!goal) {
            if (options.interactive === false) {
                logger.error('Goal is required when using --no-interactive mode');
                process.exit(1);
            }
            goal = await prompter.askForGoal();
        }

        logger.info(`Starting specification generation for: "${goal}"`);
        logger.newline();

        // Step 1: Analyze goal
        const analysis = await goalAnalyzer.analyze(goal);
        contextBuilder.initialize(goal, analysis);

        // Step 2: Generate questions
        const questions = await questionGenerator.generateInitialQuestions(analysis);
        contextBuilder.addQuestions(questions);

        // Step 3: Interactive Q&A (if not disabled)
        if (options.interactive !== false && questions.length > 0) {
            logger.section('Clarifying Questions');
            logger.info('Please answer the following questions to create a complete specification.\n');

            const answers = await prompter.askQuestions(questions);

            // Add answers to context
            for (const [questionId, answer] of Object.entries(answers)) {
                contextBuilder.addAnswer(questionId, answer);
            }

            // Show summary
            prompter.displaySummary(questions, answers);

            // Step 3.5: Optional Developer/Technical Questions
            const wantsDeveloperQuestions = await shouldAskDeveloperQuestions(prompter);

            if (wantsDeveloperQuestions) {
                const devQuestions = generateDeveloperQuestions(analysis);
                contextBuilder.addQuestions(devQuestions);

                logger.info(`\nAsking ${devQuestions.length} technical questions...\n`);
                const devAnswers = await prompter.askQuestions(devQuestions);

                // Add developer answers to context
                for (const [questionId, answer] of Object.entries(devAnswers)) {
                    contextBuilder.addAnswer(questionId, answer);
                }

                // Show summary of developer answers
                prompter.displaySummary(devQuestions, devAnswers);
            }

            // Confirm before generating
            const shouldGenerate = await prompter.confirm(
                'Generate specification with these answers?',
                true
            );

            if (!shouldGenerate) {
                logger.info('Specification generation cancelled.');
                process.exit(0);
            }
        } else if (options.interactive === false) {
            logger.info('Skipping interactive questions (--no-interactive mode)');

            // Add default answers for non-interactive mode
            questions.forEach(q => {
                const defaultAnswer = q.suggestedAnswers?.[0] || 'Not specified';
                contextBuilder.addAnswer(q.id, defaultAnswer);
            });
        }

        // Step 4: Generate specification
        logger.newline();
        const specEngine = new SpecEngine(watsonxClient, contextBuilder);
        const spec = await specEngine.generateSpec();

        // Step 5: Format as markdown
        logger.section('Formatting Specification');
        const markdown = formatter.format(spec, contextBuilder.getContext());
        const normalized = formatter.normalize(markdown);

        // Validate markdown
        const validation = formatter.validate(normalized);
        if (!validation.valid) {
            logger.warn('Markdown validation warnings:');
            validation.errors.forEach(err => logger.warn(`  - ${err}`));
        }

        // Step 6: Write to file
        const outputPath = path.resolve(options.output);
        logger.progress(`Writing to ${outputPath}`);

        try {
            fs.writeFileSync(outputPath, normalized, 'utf8');
            logger.progressDone();
        } catch (error) {
            logger.error(`Failed to write file: ${error.message}`);
            process.exit(1);
        }

        // Show completion message
        prompter.showCompletion(outputPath);

        // Show statistics
        const wordCount = formatter.getWordCount(normalized);
        const readingTime = formatter.getReadingTime(normalized);

        logger.info(`📊 Statistics:`);
        logger.info(`   - Sections: ${Object.keys(spec.sections).length}`);
        logger.info(`   - Word count: ${wordCount}`);
        logger.info(`   - Reading time: ~${readingTime} minutes`);
        logger.info(`   - File size: ${(normalized.length / 1024).toFixed(2)} KB`);

        logger.newline();
        logger.success('Done! Your specification is ready. 🎉');

    } catch (error) {
        const logger = getLogger();
        logger.error('Specification generation failed', error);

        if (error.name === 'ConfigurationError') {
            console.error(chalk.yellow('\nRun "specbaker config setup" to configure SpecBaker.'));
        } else if (error.name === 'AuthenticationError') {
            console.error(chalk.yellow('\nPlease check your watsonx.ai API credentials.'));
        }

        process.exit(1);
    }
}

module.exports = generateCommand;

// Made with Bob
