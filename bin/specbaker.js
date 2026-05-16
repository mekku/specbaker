#!/usr/bin/env node

/**
 * SpecBaker CLI Entry Point
 * 
 * This is the main entry point for the SpecBaker CLI tool.
 * It initializes the CLI and handles any top-level errors.
 */

const path = require('path');
const chalk = require('chalk');

// Load environment variables
require('dotenv').config();

// Import the main CLI module
const cli = require('../src/cli/index.js');

/**
 * Main function to run the CLI
 */
async function main() {
    try {
        await cli.run(process.argv);
    } catch (error) {
        // Handle any uncaught errors
        console.error(chalk.red('\n❌ An unexpected error occurred:\n'));
        console.error(chalk.red(error.message));

        if (process.env.DEBUG === 'true') {
            console.error(chalk.gray('\nStack trace:'));
            console.error(chalk.gray(error.stack));
        } else {
            console.error(chalk.gray('\nRun with DEBUG=true for more details.'));
        }

        process.exit(1);
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('\n❌ Unhandled Promise Rejection:'));
    console.error(chalk.red(reason));
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error(chalk.red('\n❌ Uncaught Exception:'));
    console.error(chalk.red(error.message));
    process.exit(1);
});

// Run the CLI
main();

// Made with Bob
