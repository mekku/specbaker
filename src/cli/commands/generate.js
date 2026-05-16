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

            // Step 3.5: Deep-dive questioning (unlimited rounds, priority-based)
            logger.newline();
            logger.info('💡 Tip: You can stop the questioning at any time by saying "no" to continue.');
            logger.newline();

            // Combine pair of question and and answer
            let allAnswers = { ...answers };
            let round = 1;
            let continueDeepDive = true;

            while (continueDeepDive) {
                logger.info(`\n🔍 Analyzing your answers to identify areas needing clarification...`);

                logger.debug(allAnswers);

                let allAnswersWithQuestion = contextBuilder.getQuestionsAndAnswers();
                logger.debug(allAnswersWithQuestion);

                const followUpQuestionsResult = await questionGenerator.generateFollowUpRound(
                    contextBuilder.getContext(),
                    allAnswersWithQuestion,
                    round
                );
                logger.debug(followUpQuestionsResult);
                const followUpQuestions = followUpQuestionsResult.questions ?? [];
                const followUpSummary = followUpQuestionsResult.summary ?? "";
                const confidenceReason = followUpQuestionsResult.confidenceReason ?? '';
                const confidenceScore = followUpQuestionsResult.confidenceScore ?? 0;
                const roundType = followUpQuestionsResult.roundType ?? "";
                const whatYouKnow = followUpQuestionsResult.whatYouKnow ?? "";
                const confidenceThreshold = 85

                logger.debug(`\nRound type: ${roundType}`);
                logger.debug(`Confidence: ${confidenceScore}/100`);
                logger.debug(`Reason: ${confidenceReason}`);
                logger.debug(followUpSummary);

                // Display what we know so far
                if (whatYouKnow) {
                    logger.newline();
                    logger.info(chalk.cyan('📋 What we know so far:'));
                    logger.info(chalk.gray(whatYouKnow));
                }

                // Hard stop: AI says enough
                if (followUpQuestions.length === 0 || confidenceScore >= 90) {
                    logger.success('✓ Requirements are sufficient for software specification!');
                    logger.info('Next step: generate or update the specification.');
                    break;
                }

                // Soft stop: mostly enough, ask user whether to continue.
                // Default should be NO, not YES.
                if (confidenceScore >= confidenceThreshold) {
                    const wantsFollowUp = await prompter.confirm(
                        `\n What we know so far: ${whatYouKnow}
                        \nSpecBaker confidence: ${confidenceScore}/100 (Ready to Bake)
Reason: ${confidenceReason}

The current details are probably enough for an software spec.
There are ${followUpQuestions.length} optional follow-up question(s).

${followUpSummary}
Do you still want to answer them, or should we generate the spec now?`,
                        false
                    );

                    if (!wantsFollowUp) {
                        logger.success('✓ Stopping requirement questions based on sufficient confidence.');
                        break;
                    }
                }

                // Normal continue: still not enough
                const wantsFollowUp = await prompter.confirm(
                    `\nWhat we know so far: ${whatYouKnow}
                    \nSpecBaker confidence: ${confidenceScore}/100
Reason: ${confidenceReason}

${followUpSummary}

There are ${followUpQuestions.length} important follow-up question(s).

Would you like to continue answering them?`,
                    confidenceScore < confidenceThreshold
                );

                if (!wantsFollowUp) {
                    logger.info('Stopping follow-up questions by user choice.');
                    break;
                }

                // Sort by priority (highest first)
                followUpQuestions.sort((a, b) => (a.priority || 2) - (b.priority || 2));

                contextBuilder.addQuestions(followUpQuestions);
                logger.info(`\nAsking ${followUpQuestions.length} follow-up questions (highest priority first)...`);
                logger.info('💡 Remember: You can stop at any question.\n');

                const followUpAnswers = await prompter.askQuestions(followUpQuestions);

                // Add follow-up answers to context
                for (const [questionId, answer] of Object.entries(followUpAnswers)) {
                    contextBuilder.addAnswer(questionId, answer);
                    allAnswers[questionId] = answer;
                }

                // Show summary of follow-up answers
                prompter.displaySummary(followUpQuestions, followUpAnswers);

                round++;
            }

            // Step 3.6: Optional Developer/Technical Questions
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
                '\nGenerate specification with all these answers?',
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
        const outputPathContext = path.resolve(options.output.replace(".md", ".chat.md"));
        logger.progress(`Writing to ${outputPath}`);

        // Format output context (Q&A)
        const qnas = contextBuilder.getQuestionsAndAnswers()
        logger.debug(qnas)
        const qnaMarkdown = formatter.formatQna(qnas);
        fs.writeFileSync(outputPathContext, qnaMarkdown, 'utf8');


        try {
            fs.writeFileSync(outputPath, normalized, 'utf8');
            fs.writeFileSync(outputPathContext, qnaMarkdown, 'utf8');
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
        logger.debug(error);

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
