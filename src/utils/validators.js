/**
 * Input Validators
 * 
 * Provides validation functions for user inputs and configuration values.
 */

const fs = require('fs');
const path = require('path');

/**
 * Validate goal text
 */
function validateGoal(goal) {
    if (!goal || typeof goal !== 'string') {
        return { valid: false, error: 'Goal must be a non-empty string' };
    }

    const trimmedGoal = goal.trim();

    if (trimmedGoal.length === 0) {
        return { valid: false, error: 'Goal cannot be empty' };
    }

    if (trimmedGoal.length < 10) {
        return { valid: false, error: 'Goal is too short. Please provide more details (at least 10 characters)' };
    }

    if (trimmedGoal.length > 5000) {
        return { valid: false, error: 'Goal is too long. Please keep it under 5000 characters' };
    }

    return { valid: true, value: trimmedGoal };
}

/**
 * Validate file path
 */
function validateFilePath(filePath, options = {}) {
    const { mustExist = false, extension = null, writable = false } = options;

    if (!filePath || typeof filePath !== 'string') {
        return { valid: false, error: 'File path must be a non-empty string' };
    }

    // Check for directory traversal attempts
    const normalizedPath = path.normalize(filePath);
    if (normalizedPath.includes('..')) {
        return { valid: false, error: 'Invalid file path: directory traversal not allowed' };
    }

    // Check if file must exist
    if (mustExist && !fs.existsSync(filePath)) {
        return { valid: false, error: `File does not exist: ${filePath}` };
    }

    // Check extension if specified
    if (extension && path.extname(filePath) !== extension) {
        return { valid: false, error: `File must have ${extension} extension` };
    }

    // Check if directory is writable
    if (writable) {
        const dir = path.dirname(filePath);
        try {
            fs.accessSync(dir, fs.constants.W_OK);
        } catch (error) {
            return { valid: false, error: `Directory is not writable: ${dir}` };
        }
    }

    return { valid: true, value: normalizedPath };
}

/**
 * Validate API key
 */
function validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== 'string') {
        return { valid: false, error: 'API key must be a non-empty string' };
    }

    const trimmedKey = apiKey.trim();

    if (trimmedKey.length === 0) {
        return { valid: false, error: 'API key cannot be empty' };
    }

    if (trimmedKey.length < 20) {
        return { valid: false, error: 'API key appears to be invalid (too short)' };
    }

    return { valid: true, value: trimmedKey };
}

/**
 * Validate project ID
 */
function validateProjectId(projectId) {
    if (!projectId || typeof projectId !== 'string') {
        return { valid: false, error: 'Project ID must be a non-empty string' };
    }

    const trimmedId = projectId.trim();

    if (trimmedId.length === 0) {
        return { valid: false, error: 'Project ID cannot be empty' };
    }

    // UUID format check (common for IBM Cloud project IDs)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(trimmedId)) {
        return { valid: false, error: 'Project ID must be a valid UUID format' };
    }

    return { valid: true, value: trimmedId };
}

/**
 * Validate region
 */
function validateRegion(region) {
    const validRegions = ['us-south', 'us-east', 'eu-gb', 'eu-de', 'jp-tok', 'jp-osa', 'au-syd'];

    if (!region || typeof region !== 'string') {
        return { valid: false, error: 'Region must be a non-empty string' };
    }

    const trimmedRegion = region.trim().toLowerCase();

    if (!validRegions.includes(trimmedRegion)) {
        return {
            valid: false,
            error: `Invalid region. Must be one of: ${validRegions.join(', ')}`
        };
    }

    return { valid: true, value: trimmedRegion };
}

/**
 * Validate model name
 */
function validateModel(model) {
    if (!model || typeof model !== 'string') {
        return { valid: false, error: 'Model name must be a non-empty string' };
    }

    const trimmedModel = model.trim();

    if (trimmedModel.length === 0) {
        return { valid: false, error: 'Model name cannot be empty' };
    }

    // Basic format check (provider/model-name)
    if (!trimmedModel.includes('/')) {
        return { valid: false, error: 'Model name must be in format: provider/model-name' };
    }

    return { valid: true, value: trimmedModel };
}

/**
 * Validate number in range
 */
function validateNumber(value, min, max, name = 'Value') {
    const num = Number(value);

    if (isNaN(num)) {
        return { valid: false, error: `${name} must be a number` };
    }

    if (num < min || num > max) {
        return { valid: false, error: `${name} must be between ${min} and ${max}` };
    }

    return { valid: true, value: num };
}

/**
 * Validate temperature (0.0 - 1.0)
 */
function validateTemperature(temperature) {
    return validateNumber(temperature, 0.0, 1.0, 'Temperature');
}

/**
 * Validate max tokens
 */
function validateMaxTokens(maxTokens) {
    return validateNumber(maxTokens, 1, 10000, 'Max tokens');
}

/**
 * Validate answer text
 */
function validateAnswer(answer) {
    if (!answer || typeof answer !== 'string') {
        return { valid: false, error: 'Answer must be a non-empty string' };
    }

    const trimmedAnswer = answer.trim();

    if (trimmedAnswer.length === 0) {
        return { valid: false, error: 'Answer cannot be empty' };
    }

    if (trimmedAnswer.length > 2000) {
        return { valid: false, error: 'Answer is too long. Please keep it under 2000 characters' };
    }

    return { valid: true, value: trimmedAnswer };
}

/**
 * Sanitize markdown content
 */
function sanitizeMarkdown(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    // Remove any potentially dangerous HTML/script tags
    let sanitized = content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

    return sanitized;
}

module.exports = {
    validateGoal,
    validateFilePath,
    validateApiKey,
    validateProjectId,
    validateRegion,
    validateModel,
    validateNumber,
    validateTemperature,
    validateMaxTokens,
    validateAnswer,
    sanitizeMarkdown
};

// Made with Bob
