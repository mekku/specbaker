/**
 * Config Command
 * 
 * Manages SpecBaker configuration.
 */

const chalk = require('chalk');
const inquirer = require('inquirer');
const { getConfigManager } = require('../../config/config-manager');
const { getLogger } = require('../../utils/logger');
const {
    validateApiKey,
    validateProjectId,
    validateRegion,
    validateModel
} = require('../../utils/validators');

const logger = getLogger();

/**
 * Set a configuration value
 */
async function set(key, value) {
    try {
        const configManager = getConfigManager();
        configManager.load();

        // Validate based on key
        let validation = { valid: true, value };

        if (key.includes('apiKey')) {
            validation = validateApiKey(value);
        } else if (key.includes('projectId')) {
            validation = validateProjectId(value);
        } else if (key.includes('region')) {
            validation = validateRegion(value);
        } else if (key.includes('model')) {
            validation = validateModel(value);
        }

        if (!validation.valid) {
            logger.error(`Invalid value: ${validation.error}`);
            process.exit(1);
        }

        configManager.set(key, validation.value);

        if (configManager.save()) {
            logger.success(`Configuration updated: ${key} = ${maskSensitive(key, validation.value)}`);
        } else {
            logger.error('Failed to save configuration');
            process.exit(1);
        }

    } catch (error) {
        logger.error('Failed to set configuration', error);
        process.exit(1);
    }
}

/**
 * Get a configuration value
 */
async function get(key) {
    try {
        const configManager = getConfigManager();
        configManager.load();

        const value = configManager.get(key);

        if (value === undefined) {
            logger.warn(`Configuration key not found: ${key}`);
            process.exit(1);
        }

        console.log(chalk.cyan(key) + ': ' + chalk.white(maskSensitive(key, value)));

    } catch (error) {
        logger.error('Failed to get configuration', error);
        process.exit(1);
    }
}

/**
 * List all configuration values
 */
async function list() {
    try {
        const configManager = getConfigManager();
        configManager.load();

        const config = configManager.getSafeConfig();

        console.log(chalk.bold.cyan('\n📋 Current Configuration:\n'));

        printConfigSection('watsonx.ai', config.watsonx);
        printConfigSection('Output', config.output);
        printConfigSection('Prompts', config.prompts);
        printConfigSection('Logging', config.logging);

        console.log();

    } catch (error) {
        logger.error('Failed to list configuration', error);
        process.exit(1);
    }
}

/**
 * Interactive configuration setup
 */
async function setup() {
    try {
        console.log(chalk.bold.cyan('\n🔧 SpecBaker Configuration Setup\n'));
        console.log(chalk.gray('This wizard will help you configure SpecBaker.\n'));

        const configManager = getConfigManager();
        configManager.load();

        // Get current values
        const currentConfig = configManager.getAll();

        // Ask for watsonx.ai credentials
        console.log(chalk.bold('\n1. IBM watsonx.ai Credentials'));
        console.log(chalk.gray('   Get your credentials from: https://cloud.ibm.com/iam/apikeys\n'));

        const answers = await inquirer.prompt([
            {
                type: 'password',
                name: 'apiKey',
                message: 'watsonx.ai API Key:',
                default: currentConfig.watsonx.apiKey,
                validate: (input) => {
                    const validation = validateApiKey(input);
                    return validation.valid || validation.error;
                },
                mask: '*'
            },
            {
                type: 'input',
                name: 'projectId',
                message: 'watsonx.ai Project ID:',
                default: currentConfig.watsonx.projectId,
                validate: (input) => {
                    const validation = validateProjectId(input);
                    return validation.valid || validation.error;
                }
            },
            {
                type: 'list',
                name: 'region',
                message: 'watsonx.ai Region:',
                choices: ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok', 'jp-osa', 'au-syd'],
                default: currentConfig.watsonx.region
            },
            {
                type: 'list',
                name: 'model',
                message: 'Preferred Model:',
                choices: [
                    'ibm/granite-13b-chat-v2',
                    'ibm/granite-20b-multilingual',
                    'meta-llama/llama-2-70b-chat',
                    'meta-llama/llama-2-13b-chat'
                ],
                default: currentConfig.watsonx.model
            }
        ]);

        // Ask for output preferences
        console.log(chalk.bold('\n2. Output Preferences\n'));

        const outputAnswers = await inquirer.prompt([
            {
                type: 'input',
                name: 'defaultPath',
                message: 'Default output file path:',
                default: currentConfig.output.defaultPath
            },
            {
                type: 'confirm',
                name: 'includeTimestamp',
                message: 'Include timestamp in generated specs?',
                default: currentConfig.output.includeTimestamp
            }
        ]);

        // Ask for prompt preferences
        console.log(chalk.bold('\n3. Question Preferences\n'));

        const promptAnswers = await inquirer.prompt([
            {
                type: 'number',
                name: 'maxQuestions',
                message: 'Maximum number of questions to ask:',
                default: currentConfig.prompts.maxQuestions,
                validate: (input) => {
                    if (input < 1 || input > 20) {
                        return 'Please enter a number between 1 and 20';
                    }
                    return true;
                }
            },
            {
                type: 'list',
                name: 'questionDepth',
                message: 'Question depth level:',
                choices: [
                    { name: 'Basic (fewer questions)', value: 'basic' },
                    { name: 'Detailed (recommended)', value: 'detailed' },
                    { name: 'Comprehensive (more questions)', value: 'comprehensive' }
                ],
                default: currentConfig.prompts.questionDepth
            }
        ]);

        // Update configuration
        configManager.set('watsonx.apiKey', answers.apiKey);
        configManager.set('watsonx.projectId', answers.projectId);
        configManager.set('watsonx.region', answers.region);
        configManager.set('watsonx.model', answers.model);
        configManager.set('output.defaultPath', outputAnswers.defaultPath);
        configManager.set('output.includeTimestamp', outputAnswers.includeTimestamp);
        configManager.set('prompts.maxQuestions', promptAnswers.maxQuestions);
        configManager.set('prompts.questionDepth', promptAnswers.questionDepth);

        // Save configuration
        if (configManager.save()) {
            console.log(chalk.bold.green('\n✅ Configuration saved successfully!\n'));
            console.log(chalk.gray('You can now run: ') + chalk.cyan('specbaker generate "your goal"\n'));
        } else {
            logger.error('Failed to save configuration');
            process.exit(1);
        }

    } catch (error) {
        logger.error('Configuration setup failed', error);
        process.exit(1);
    }
}

/**
 * Print a configuration section
 */
function printConfigSection(title, config) {
    console.log(chalk.bold(title + ':'));

    for (const [key, value] of Object.entries(config)) {
        const displayValue = typeof value === 'object'
            ? JSON.stringify(value)
            : String(value);
        console.log(`  ${chalk.gray(key)}: ${chalk.white(displayValue)}`);
    }

    console.log();
}

/**
 * Mask sensitive values
 */
function maskSensitive(key, value) {
    if (key.toLowerCase().includes('apikey') || key.toLowerCase().includes('password')) {
        if (typeof value === 'string' && value.length > 4) {
            return '***' + value.slice(-4);
        }
        return '***';
    }
    return value;
}

module.exports = {
    set,
    get,
    list,
    setup
};

// Made with Bob
