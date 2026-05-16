/**
 * Interactive Prompter
 * 
 * Handles interactive CLI prompts for collecting user answers.
 */

const inquirer = require('inquirer');
const chalk = require('chalk');
const { validateAnswer } = require('../utils/validators');
const { getLogger } = require('../utils/logger');

const logger = getLogger();

class InteractivePrompter {
    constructor(config) {
        this.config = config;
    }

    /**
     * Ask a single question
     */
    async askQuestion(question, currentIndex, totalQuestions) {
        logger.newline();
        logger.step(currentIndex, totalQuestions, chalk.bold(question.text));

        if (question.category) {
            console.log(chalk.gray(`Category: ${question.category}`));
        }

        const promptConfig = {
            type: question.suggestedAnswers && question.suggestedAnswers.length > 0 ? 'list' : 'input',
            name: 'answer',
            message: 'Your answer:',
            validate: (input) => {
                if (question.suggestedAnswers && question.suggestedAnswers.length > 0) {
                    return true; // List selections are always valid
                }
                const validation = validateAnswer(input);
                return validation.valid || validation.error;
            }
        };

        // Add choices if suggested answers exist
        if (question.suggestedAnswers && question.suggestedAnswers.length > 0) {
            promptConfig.choices = [
                ...question.suggestedAnswers,
                new inquirer.Separator(),
                'Other (type custom answer)'
            ];
        }

        const response = await inquirer.prompt([promptConfig]);
        let answer = response.answer;

        // If user selected "Other", ask for custom input
        if (answer === 'Other (type custom answer)') {
            const customResponse = await inquirer.prompt([{
                type: 'input',
                name: 'customAnswer',
                message: 'Please provide your answer:',
                validate: (input) => {
                    const validation = validateAnswer(input);
                    return validation.valid || validation.error;
                }
            }]);
            answer = customResponse.customAnswer;
        }

        return answer.trim();
    }

    /**
     * Ask multiple questions in sequence
     */
    async askQuestions(questions) {
        const answers = {};
        const totalQuestions = questions.length;

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];

            try {
                const answer = await this.askQuestion(question, i + 1, totalQuestions);
                answers[question.id] = answer;

                // Ask if user wants to continue after each answer
                if (i < questions.length - 1) {
                    const shouldContinue = await this.confirm(
                        'Continue to next question?',
                        true
                    );

                    if (!shouldContinue) {
                        logger.info('Stopping questions. You can continue later or generate spec with current answers.');
                        break;
                    }
                }
            } catch (error) {
                if (error.isTtyError) {
                    logger.error('Prompt could not be rendered in this environment');
                    throw error;
                } else {
                    logger.error('Error during question prompt', error);
                    throw error;
                }
            }
        }

        return answers;
    }

    /**
     * Confirm with user (yes/no question)
     */
    async confirm(message, defaultValue = true) {
        const response = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirmed',
            message,
            default: defaultValue
        }]);

        return response.confirmed;
    }

    /**
     * Show progress indicator
     */
    showProgress(current, total) {
        const percentage = Math.round((current / total) * 100);
        const filled = Math.round(percentage / 5);
        const empty = 20 - filled;

        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        console.log(chalk.cyan(`\nProgress: [${bar}] ${percentage}% (${current}/${total})`));
    }

    /**
     * Display summary of answers
     */
    displaySummary(questions, answers) {
        logger.section('Summary of Your Answers');

        const answersByCategory = {};

        questions.forEach(question => {
            if (answers[question.id]) {
                if (!answersByCategory[question.category]) {
                    answersByCategory[question.category] = [];
                }
                answersByCategory[question.category].push({
                    question: question.text,
                    answer: answers[question.id]
                });
            }
        });

        for (const [category, items] of Object.entries(answersByCategory)) {
            console.log(chalk.bold.cyan(`\n${category}:`));
            items.forEach(({ question, answer }) => {
                console.log(chalk.gray(`  Q: ${question}`));
                console.log(chalk.white(`  A: ${answer}`));
            });
        }

        logger.newline();
    }

    /**
     * Ask for goal if not provided
     */
    async askForGoal() {
        logger.section('Welcome to SpecBaker! 🎂');
        console.log(chalk.gray('Transform your vague software ideas into structured specifications.\n'));

        const response = await inquirer.prompt([{
            type: 'input',
            name: 'goal',
            message: 'What do you want to build?',
            validate: (input) => {
                const validation = validateAnswer(input);
                if (!validation.valid) {
                    return validation.error;
                }
                if (input.trim().length < 10) {
                    return 'Please provide more details (at least 10 characters)';
                }
                return true;
            }
        }]);

        return response.goal.trim();
    }

    /**
     * Show welcome message
     */
    showWelcome() {
        console.log(chalk.bold.cyan('\n╔════════════════════════════════════════╗'));
        console.log(chalk.bold.cyan('║                                        ║'));
        console.log(chalk.bold.cyan('║         Welcome to SpecBaker! 🎂       ║'));
        console.log(chalk.bold.cyan('║                                        ║'));
        console.log(chalk.bold.cyan('╚════════════════════════════════════════╝\n'));
        console.log(chalk.gray('Powered by IBM watsonx.ai\n'));
    }

    /**
     * Show completion message
     */
    showCompletion(outputPath) {
        logger.newline();
        console.log(chalk.bold.green('╔════════════════════════════════════════╗'));
        console.log(chalk.bold.green('║                                        ║'));
        console.log(chalk.bold.green('║     Specification Generated! ✨        ║'));
        console.log(chalk.bold.green('║                                        ║'));
        console.log(chalk.bold.green('╚════════════════════════════════════════╝\n'));
        console.log(chalk.white(`Your specification has been saved to: ${chalk.cyan(outputPath)}\n`));
        console.log(chalk.gray('You can now use this specification with IBM Bob or any developer.\n'));
    }

    /**
     * Select from list
     */
    async selectFromList(message, choices, defaultChoice = null) {
        const response = await inquirer.prompt([{
            type: 'list',
            name: 'selection',
            message,
            choices,
            default: defaultChoice
        }]);

        return response.selection;
    }

    /**
     * Multi-select from list
     */
    async multiSelect(message, choices) {
        const response = await inquirer.prompt([{
            type: 'checkbox',
            name: 'selections',
            message,
            choices,
            validate: (answer) => {
                if (answer.length < 1) {
                    return 'You must choose at least one option.';
                }
                return true;
            }
        }]);

        return response.selections;
    }

    /**
     * Ask for text input
     */
    async askInput(message, defaultValue = null, validator = null) {
        const promptConfig = {
            type: 'input',
            name: 'input',
            message
        };

        if (defaultValue) {
            promptConfig.default = defaultValue;
        }

        if (validator) {
            promptConfig.validate = validator;
        }

        const response = await inquirer.prompt([promptConfig]);
        return response.input;
    }

    /**
     * Show error message
     */
    showError(message) {
        console.log(chalk.red(`\n❌ Error: ${message}\n`));
    }

    /**
     * Show warning message
     */
    showWarning(message) {
        console.log(chalk.yellow(`\n⚠️  Warning: ${message}\n`));
    }

    /**
     * Show info message
     */
    showInfo(message) {
        console.log(chalk.blue(`\nℹ️  ${message}\n`));
    }
}

module.exports = InteractivePrompter;

// Made with Bob
