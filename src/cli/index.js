/**
 * SpecBaker CLI Main Module
 * 
 * This module sets up the CLI interface using Commander.js
 * and routes commands to their respective handlers.
 */

const { Command } = require('commander');
const chalk = require('chalk');
const packageJson = require('../../package.json');

// Import command handlers
const generateCommand = require('./commands/generate');
const configCommand = require('./commands/config');
const validateCommand = require('./commands/validate');

/**
 * Initialize and configure the CLI
 */
function initializeCLI() {
    const program = new Command();

    program
        .name('specbaker')
        .description(chalk.cyan('Transform vague software goals into structured, implementation-ready specifications'))
        .version(packageJson.version, '-v, --version', 'Display version number')
        .helpOption('-h, --help', 'Display help information');

    // Register commands
    registerCommands(program);

    return program;
}

/**
 * Register all CLI commands
 */
function registerCommands(program) {
    // Generate command - Main functionality
    program
        .command('generate [goal]')
        .description('Generate a specification from a software goal')
        .option('-o, --output <path>', 'Output file path', 'specification.md')
        .option('-c, --config <path>', 'Config file path')
        .option('--no-interactive', 'Skip interactive prompts (use defaults)')
        .option('--verbose', 'Enable verbose output')
        .option('--debug', 'Enable debug mode')
        .action(generateCommand);

    // Config command - Configuration management
    const config = program
        .command('config')
        .description('Manage SpecBaker configuration');

    config
        .command('set <key> <value>')
        .description('Set a configuration value')
        .action(configCommand.set);

    config
        .command('get <key>')
        .description('Get a configuration value')
        .action(configCommand.get);

    config
        .command('list')
        .description('List all configuration values')
        .action(configCommand.list);

    config
        .command('setup')
        .description('Interactive configuration setup')
        .action(configCommand.setup);

    // Validate command - Validate existing specifications
    program
        .command('validate <file>')
        .description('Validate an existing specification file')
        .option('--strict', 'Use strict validation rules')
        .action(validateCommand);

    // Add examples to help
    program.addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Generate a specification interactively')}
  $ specbaker generate "Build a todo app"

  ${chalk.gray('# Generate with custom output path')}
  $ specbaker generate "E-commerce platform" -o my-spec.md

  ${chalk.gray('# Configure API key')}
  $ specbaker config set watsonx.apiKey YOUR_API_KEY

  ${chalk.gray('# Run interactive setup')}
  $ specbaker config setup

  ${chalk.gray('# Validate a specification')}
  $ specbaker validate specification.md

${chalk.bold('Documentation:')}
  ${chalk.cyan('https://github.com/yourusername/specbaker#readme')}
`);
}

/**
 * Run the CLI with provided arguments
 */
async function run(argv) {
    const program = initializeCLI();

    try {
        await program.parseAsync(argv);
    } catch (error) {
        handleError(error);
        throw error;
    }
}

/**
 * Handle CLI errors gracefully
 */
function handleError(error) {
    if (error.code === 'ENOENT') {
        console.error(chalk.red(`\n❌ File not found: ${error.path}`));
    } else if (error.code === 'EACCES') {
        console.error(chalk.red(`\n❌ Permission denied: ${error.path}`));
    } else if (error.name === 'ConfigurationError') {
        console.error(chalk.red(`\n❌ Configuration error: ${error.message}`));
        console.error(chalk.yellow('\nRun "specbaker config setup" to configure SpecBaker.'));
    } else if (error.name === 'AuthenticationError') {
        console.error(chalk.red(`\n❌ Authentication failed: ${error.message}`));
        console.error(chalk.yellow('\nPlease check your watsonx.ai API credentials.'));
    } else {
        // Generic error handling is done in bin/specbaker.js
    }
}

module.exports = {
    run,
    initializeCLI,
    registerCommands,
    handleError
};

// Made with Bob
