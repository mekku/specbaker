/**
 * Configuration Manager
 * 
 * Manages application configuration from multiple sources:
 * 1. Command-line flags (highest priority)
 * 2. Environment variables
 * 3. Config file (~/.specbaker/config.json)
 * 4. Default values (lowest priority)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateApiKey, validateProjectId, validateRegion, validateModel } = require('../utils/validators');
const { getLogger } = require('../utils/logger');

const logger = getLogger();

// Default configuration
const DEFAULT_CONFIG = {
    watsonx: {
        apiKey: null,
        projectId: null,
        region: 'us-south',
        model: 'ibm/granite-13b-chat-v2',
        maxTokens: 2000,
        temperature: 0.4
    },
    output: {
        defaultPath: 'specification.md',
        format: 'markdown',
        includeTimestamp: true
    },
    prompts: {
        maxQuestions: 10,
        questionDepth: 'detailed' // basic, detailed, comprehensive
    },
    logging: {
        level: 'INFO',
        verbose: false,
        debug: false
    }
};

class ConfigManager {
    constructor() {
        this.config = null;
        this.configDir = path.join(os.homedir(), '.specbaker');
        this.configPath = path.join(this.configDir, 'config.json');
    }

    /**
     * Load configuration from all sources
     */
    load(cliOptions = {}) {
        // Start with defaults
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // Load from config file if exists
        const fileConfig = this.loadFromFile();
        if (fileConfig) {
            this.merge(this.config, fileConfig);
        }

        // Override with environment variables
        this.loadFromEnv();

        // Override with CLI options (highest priority)
        if (cliOptions) {
            this.loadFromCLI(cliOptions);
        }

        logger.debug('Configuration loaded', this.getSafeConfig());

        return this.config;
    }

    /**
     * Load configuration from file
     */
    loadFromFile() {
        try {
            if (fs.existsSync(this.configPath)) {
                const content = fs.readFileSync(this.configPath, 'utf8');
                return JSON.parse(content);
            }
        } catch (error) {
            logger.warn(`Failed to load config file: ${error.message}`);
        }
        return null;
    }

    /**
     * Load configuration from environment variables
     */
    loadFromEnv() {
        if (process.env.WATSONX_API_KEY) {
            this.config.watsonx.apiKey = process.env.WATSONX_API_KEY;
        }
        if (process.env.WATSONX_PROJECT_ID) {
            this.config.watsonx.projectId = process.env.WATSONX_PROJECT_ID;
        }
        if (process.env.WATSONX_REGION) {
            this.config.watsonx.region = process.env.WATSONX_REGION;
        }
        if (process.env.WATSONX_MODEL) {
            this.config.watsonx.model = process.env.WATSONX_MODEL;
        }
        if (process.env.WATSONX_MAX_TOKENS) {
            this.config.watsonx.maxTokens = parseInt(process.env.WATSONX_MAX_TOKENS, 10);
        }
        if (process.env.WATSONX_TEMPERATURE) {
            this.config.watsonx.temperature = parseFloat(process.env.WATSONX_TEMPERATURE);
        }
        if (process.env.MAX_QUESTIONS) {
            this.config.prompts.maxQuestions = parseInt(process.env.MAX_QUESTIONS, 10);
        }
        if (process.env.QUESTION_DEPTH) {
            this.config.prompts.questionDepth = process.env.QUESTION_DEPTH;
        }
        if (process.env.DEFAULT_OUTPUT_PATH) {
            this.config.output.defaultPath = process.env.DEFAULT_OUTPUT_PATH;
        }
        if (process.env.VERBOSE === 'true') {
            this.config.logging.verbose = true;
        }
        if (process.env.DEBUG === 'true') {
            this.config.logging.debug = true;
        }
    }

    /**
     * Load configuration from CLI options
     */
    loadFromCLI(options) {
        if (options.output) {
            this.config.output.defaultPath = options.output;
        }
        if (options.verbose) {
            this.config.logging.verbose = true;
        }
        if (options.debug) {
            this.config.logging.debug = true;
        }
        if (options.config) {
            // Load custom config file
            try {
                const customConfig = JSON.parse(fs.readFileSync(options.config, 'utf8'));
                this.merge(this.config, customConfig);
            } catch (error) {
                logger.warn(`Failed to load custom config file: ${error.message}`);
            }
        }
    }

    /**
     * Get a configuration value by key path
     */
    get(keyPath) {
        if (!this.config) {
            this.load();
        }

        const keys = keyPath.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }

        return value;
    }

    /**
     * Set a configuration value by key path
     */
    set(keyPath, value) {
        if (!this.config) {
            this.load();
        }

        const keys = keyPath.split('.');
        let current = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
    }

    /**
     * Validate configuration
     */
    validate() {
        const errors = [];

        // Validate API key
        if (!this.config.watsonx.apiKey) {
            errors.push('watsonx.apiKey is required');
        } else {
            const validation = validateApiKey(this.config.watsonx.apiKey);
            if (!validation.valid) {
                errors.push(`watsonx.apiKey: ${validation.error}`);
            }
        }

        // Validate project ID
        if (!this.config.watsonx.projectId) {
            errors.push('watsonx.projectId is required');
        } else {
            const validation = validateProjectId(this.config.watsonx.projectId);
            if (!validation.valid) {
                errors.push(`watsonx.projectId: ${validation.error}`);
            }
        }

        // Validate region
        const regionValidation = validateRegion(this.config.watsonx.region);
        if (!regionValidation.valid) {
            errors.push(`watsonx.region: ${regionValidation.error}`);
        }

        // Validate model
        const modelValidation = validateModel(this.config.watsonx.model);
        if (!modelValidation.valid) {
            errors.push(`watsonx.model: ${modelValidation.error}`);
        }

        if (errors.length > 0) {
            const error = new Error('Configuration validation failed:\n' + errors.join('\n'));
            error.name = 'ConfigurationError';
            error.errors = errors;
            throw error;
        }

        return true;
    }

    /**
     * Save configuration to file
     */
    save() {
        try {
            // Ensure config directory exists
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }

            // Write config file
            fs.writeFileSync(
                this.configPath,
                JSON.stringify(this.config, null, 2),
                'utf8'
            );

            logger.success(`Configuration saved to ${this.configPath}`);
            return true;
        } catch (error) {
            logger.error(`Failed to save configuration: ${error.message}`);
            return false;
        }
    }

    /**
     * Get configuration with sensitive data masked
     */
    getSafeConfig() {
        const safe = JSON.parse(JSON.stringify(this.config));
        if (safe.watsonx.apiKey) {
            safe.watsonx.apiKey = '***' + safe.watsonx.apiKey.slice(-4);
        }
        return safe;
    }

    /**
     * Merge two configuration objects
     */
    merge(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                this.merge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }

    /**
     * Reset to default configuration
     */
    reset() {
        this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        return this.config;
    }

    /**
     * Get all configuration as object
     */
    getAll() {
        if (!this.config) {
            this.load();
        }
        return this.config;
    }
}

// Singleton instance
let configManagerInstance = null;

function getConfigManager() {
    if (!configManagerInstance) {
        configManagerInstance = new ConfigManager();
    }
    return configManagerInstance;
}

module.exports = {
    ConfigManager,
    getConfigManager,
    DEFAULT_CONFIG
};

// Made with Bob
