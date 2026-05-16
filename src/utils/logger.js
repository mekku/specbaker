/**
 * Logger Utility
 * 
 * Provides consistent logging across the application with different log levels.
 */

const chalk = require('chalk');

const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
    TRACE: 4
};

class Logger {
    constructor(options = {}) {
        this.level = this.parseLevel(options.level || process.env.LOG_LEVEL || 'INFO');
        this.verbose = options.verbose || process.env.VERBOSE === 'true';
        this.debugMode = options.debug || process.env.DEBUG === 'true';

        // Adjust level based on flags
        if (this.debugMode) {
            this.level = LOG_LEVELS.DEBUG;
        } else if (this.verbose) {
            this.level = LOG_LEVELS.INFO;
        }
    }

    parseLevel(level) {
        const upperLevel = level.toUpperCase();
        return LOG_LEVELS[upperLevel] !== undefined ? LOG_LEVELS[upperLevel] : LOG_LEVELS.INFO;
    }

    error(message, error = null) {
        if (this.level >= LOG_LEVELS.ERROR) {
            console.error(chalk.red('❌ ERROR:'), message);
            if (error && this.debugMode) {
                console.error(chalk.gray(error.stack || error));
            }
        }
    }

    warn(message) {
        if (this.level >= LOG_LEVELS.WARN) {
            console.warn(chalk.yellow('⚠️  WARN:'), message);
        }
    }

    info(message) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log(chalk.blue('ℹ️  INFO:'), message);
        }
    }

    success(message) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log(chalk.green('✅'), message);
        }
    }

    debug(message, data = null) {
        if (this.level >= LOG_LEVELS.DEBUG) {
            console.log(chalk.gray('🔍 DEBUG:'), message);
            if (data) {
                console.log(chalk.gray(JSON.stringify(data, null, 2)));
            }
        }
    }

    trace(message, data = null) {
        if (this.level >= LOG_LEVELS.TRACE) {
            console.log(chalk.gray('🔬 TRACE:'), message);
            if (data) {
                console.log(chalk.gray(JSON.stringify(data, null, 2)));
            }
        }
    }

    // Special formatters
    section(title) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log('\n' + chalk.bold.cyan(`━━━ ${title} ━━━`));
        }
    }

    step(number, total, message) {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log(chalk.cyan(`[${number}/${total}]`), message);
        }
    }

    progress(message) {
        if (this.level >= LOG_LEVELS.INFO) {
            process.stdout.write(chalk.gray(`⏳ ${message}...`));
        }
    }

    progressDone() {
        if (this.level >= LOG_LEVELS.INFO) {
            process.stdout.write(chalk.green(' ✓\n'));
        }
    }

    newline() {
        if (this.level >= LOG_LEVELS.INFO) {
            console.log();
        }
    }
}

// Create a singleton instance
let loggerInstance = null;

function getLogger(options = {}) {
    if (!loggerInstance) {
        loggerInstance = new Logger(options);
    }
    return loggerInstance;
}

function setLogger(options) {
    loggerInstance = new Logger(options);
    return loggerInstance;
}

module.exports = {
    Logger,
    getLogger,
    setLogger,
    LOG_LEVELS
};

// Made with Bob
