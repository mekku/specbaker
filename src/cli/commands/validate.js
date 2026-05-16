/**
 * Validate Command
 * 
 * Validates existing specification files.
 */

const fs = require('fs');
const chalk = require('chalk');
const { validateFilePath } = require('../../utils/validators');
const { getLogger } = require('../../utils/logger');

const logger = getLogger();

/**
 * Validate command handler
 */
async function validateCommand(file, options) {
    try {
        logger.section('Validating Specification');

        // Validate file path
        const pathValidation = validateFilePath(file, {
            mustExist: true,
            extension: '.md'
        });

        if (!pathValidation.valid) {
            logger.error(pathValidation.error);
            process.exit(1);
        }

        // Read file
        logger.progress('Reading file');
        let content;
        try {
            content = fs.readFileSync(file, 'utf8');
            logger.progressDone();
        } catch (error) {
            logger.error(`Failed to read file: ${error.message}`);
            process.exit(1);
        }

        // Perform validation checks
        const results = {
            fileSize: content.length,
            lineCount: content.split('\n').length,
            wordCount: countWords(content),
            checks: []
        };

        // Check 1: File is not empty
        results.checks.push(checkNotEmpty(content));

        // Check 2: Has proper markdown structure
        results.checks.push(checkMarkdownStructure(content));

        // Check 3: Has required sections
        results.checks.push(checkRequiredSections(content, options.strict));

        // Check 4: No unclosed code blocks
        results.checks.push(checkCodeBlocks(content));

        // Check 5: Proper heading hierarchy
        results.checks.push(checkHeadingHierarchy(content));

        // Check 6: Has table of contents
        results.checks.push(checkTableOfContents(content));

        // Check 7: Links are valid
        results.checks.push(checkLinks(content));

        // Display results
        displayResults(file, results, options.strict);

        // Exit with appropriate code
        const failed = results.checks.filter(c => !c.passed).length;
        if (failed > 0 && options.strict) {
            process.exit(1);
        }

    } catch (error) {
        logger.error('Validation failed', error);
        process.exit(1);
    }
}

/**
 * Check if file is not empty
 */
function checkNotEmpty(content) {
    const passed = content.trim().length > 0;
    return {
        name: 'File not empty',
        passed,
        message: passed ? 'File has content' : 'File is empty',
        severity: 'error'
    };
}

/**
 * Check markdown structure
 */
function checkMarkdownStructure(content) {
    const hasHeadings = /^#{1,6}\s+.+$/m.test(content);
    return {
        name: 'Markdown structure',
        passed: hasHeadings,
        message: hasHeadings ? 'Has proper markdown headings' : 'No markdown headings found',
        severity: 'error'
    };
}

/**
 * Check required sections
 */
function checkRequiredSections(content, strict) {
    const requiredSections = [
        'Product Summary',
        'User Roles',
        'Core Requirements',
        'Implementation Plan'
    ];

    const recommendedSections = [
        'Access & Deployment',
        'Important Decisions',
        'User Journey',
        'Data Model',
        'UI Screen',
        'Test Scenarios',
        'Bob-Ready Prompt'
    ];

    const missingSections = [];
    const missingRecommended = [];

    requiredSections.forEach(section => {
        if (!content.includes(section)) {
            missingSections.push(section);
        }
    });

    recommendedSections.forEach(section => {
        if (!content.includes(section)) {
            missingRecommended.push(section);
        }
    });

    const passed = missingSections.length === 0;
    let message = passed ? 'All required sections present' : `Missing sections: ${missingSections.join(', ')}`;

    if (missingRecommended.length > 0 && strict) {
        message += `\nMissing recommended: ${missingRecommended.join(', ')}`;
    }

    return {
        name: 'Required sections',
        passed,
        message,
        severity: 'error',
        details: { missingSections, missingRecommended }
    };
}

/**
 * Check code blocks
 */
function checkCodeBlocks(content) {
    const codeBlockCount = (content.match(/```/g) || []).length;
    const passed = codeBlockCount % 2 === 0;

    return {
        name: 'Code blocks',
        passed,
        message: passed ? 'All code blocks properly closed' : 'Unclosed code block detected',
        severity: 'error'
    };
}

/**
 * Check heading hierarchy
 */
function checkHeadingHierarchy(content) {
    const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
    const issues = [];
    let lastLevel = 0;

    headings.forEach((heading, index) => {
        const level = heading.match(/^#+/)[0].length;
        if (level > lastLevel + 1 && lastLevel > 0) {
            issues.push(`Line ${index + 1}: Skipped from h${lastLevel} to h${level}`);
        }
        lastLevel = level;
    });

    const passed = issues.length === 0;

    return {
        name: 'Heading hierarchy',
        passed,
        message: passed ? 'Proper heading hierarchy' : `${issues.length} hierarchy issues`,
        severity: 'warning',
        details: issues
    };
}

/**
 * Check table of contents
 */
function checkTableOfContents(content) {
    const hasTOC = /table of contents/i.test(content);

    return {
        name: 'Table of contents',
        passed: hasTOC,
        message: hasTOC ? 'Table of contents present' : 'No table of contents found',
        severity: 'warning'
    };
}

/**
 * Check links
 */
function checkLinks(content) {
    const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    const brokenLinks = [];

    links.forEach(link => {
        const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
            const url = match[2];
            // Check for empty or invalid links
            if (!url || url.trim() === '' || url === '#') {
                brokenLinks.push(link);
            }
        }
    });

    const passed = brokenLinks.length === 0;

    return {
        name: 'Links',
        passed,
        message: passed ? `All ${links.length} links valid` : `${brokenLinks.length} broken links`,
        severity: 'warning',
        details: brokenLinks
    };
}

/**
 * Count words in content
 */
function countWords(content) {
    const withoutCode = content.replace(/```[\s\S]*?```/g, '');
    const plainText = withoutCode.replace(/[#*`>\[\]()]/g, '').replace(/\n+/g, ' ');
    return plainText.trim().split(/\s+/).length;
}

/**
 * Display validation results
 */
function displayResults(file, results, strict) {
    console.log(chalk.bold.cyan(`\n📄 File: ${file}\n`));

    // File statistics
    console.log(chalk.bold('Statistics:'));
    console.log(`  File size: ${(results.fileSize / 1024).toFixed(2)} KB`);
    console.log(`  Lines: ${results.lineCount}`);
    console.log(`  Words: ${results.wordCount}`);
    console.log();

    // Validation checks
    console.log(chalk.bold('Validation Results:\n'));

    let passedCount = 0;
    let errorCount = 0;
    let warningCount = 0;

    results.checks.forEach(check => {
        const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
        const severity = check.severity === 'error' ? chalk.red('[ERROR]') : chalk.yellow('[WARN]');

        console.log(`${icon} ${check.name}`);
        console.log(`  ${check.passed ? chalk.gray(check.message) : severity + ' ' + check.message}`);

        if (check.details && !check.passed) {
            if (Array.isArray(check.details)) {
                check.details.slice(0, 3).forEach(detail => {
                    console.log(chalk.gray(`    - ${detail}`));
                });
                if (check.details.length > 3) {
                    console.log(chalk.gray(`    ... and ${check.details.length - 3} more`));
                }
            }
        }
        console.log();

        if (check.passed) {
            passedCount++;
        } else if (check.severity === 'error') {
            errorCount++;
        } else {
            warningCount++;
        }
    });

    // Summary
    console.log(chalk.bold('Summary:'));
    console.log(`  ${chalk.green('Passed:')} ${passedCount}`);
    if (errorCount > 0) {
        console.log(`  ${chalk.red('Errors:')} ${errorCount}`);
    }
    if (warningCount > 0) {
        console.log(`  ${chalk.yellow('Warnings:')} ${warningCount}`);
    }
    console.log();

    // Final verdict
    if (errorCount === 0 && warningCount === 0) {
        console.log(chalk.bold.green('✅ Specification is valid!\n'));
    } else if (errorCount === 0) {
        console.log(chalk.bold.yellow('⚠️  Specification is valid but has warnings.\n'));
    } else {
        console.log(chalk.bold.red('❌ Specification has errors that should be fixed.\n'));
    }
}

module.exports = validateCommand;

// Made with Bob
