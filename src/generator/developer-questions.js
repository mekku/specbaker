/**
 * Developer/Technical Questions
 * 
 * Optional advanced questions for SA/developers who want to specify
 * technical details. These can be skipped by non-technical users.
 */

const { getLogger } = require('../utils/logger');
const logger = getLogger();

/**
 * Generate developer/technical questions
 * These are optional and can be skipped
 */
function generateDeveloperQuestions(analysis) {
    const questions = [];
    let idCounter = 100; // Start from 100 to avoid conflicts

    // Architecture questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Architecture',
        text: 'What architectural pattern would you prefer?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            'Monolithic',
            'Microservices',
            'Serverless',
            'Event-driven',
            'Layered architecture',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'Architecture',
        text: 'What design patterns should be used?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'MVC/MVVM',
            'Repository pattern',
            'Factory pattern',
            'Singleton',
            'Observer pattern',
            'Dependency injection',
            'No specific patterns'
        ]
    });

    // Technology Stack questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Technology Stack',
        text: 'Preferred backend technology/framework?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            'Node.js (Express, NestJS)',
            'Python (Django, Flask, FastAPI)',
            'Java (Spring Boot)',
            'C# (.NET)',
            'Go',
            'Ruby (Rails)',
            'PHP (Laravel)',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'Technology Stack',
        text: 'Preferred frontend technology/framework?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            'React',
            'Vue.js',
            'Angular',
            'Svelte',
            'Next.js',
            'Vanilla JavaScript',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'Technology Stack',
        text: 'Preferred database type?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'PostgreSQL',
            'MySQL/MariaDB',
            'MongoDB',
            'Redis',
            'Elasticsearch',
            'SQLite',
            'No preference'
        ]
    });

    // API & Integration questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'API & Integration',
        text: 'What API style should be used?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            'REST API',
            'GraphQL',
            'gRPC',
            'WebSocket',
            'Mixed approach',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'API & Integration',
        text: 'Authentication/Authorization method?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'JWT',
            'OAuth 2.0',
            'Session-based',
            'API Keys',
            'SAML',
            'No preference'
        ]
    });

    // DevOps & Infrastructure questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'DevOps',
        text: 'Preferred cloud provider?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            'AWS',
            'Azure',
            'Google Cloud',
            'IBM Cloud',
            'DigitalOcean',
            'Heroku',
            'On-premises',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'DevOps',
        text: 'Containerization and orchestration?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'Docker',
            'Kubernetes',
            'Docker Compose',
            'Not needed',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'DevOps',
        text: 'CI/CD pipeline requirements?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'GitHub Actions',
            'GitLab CI',
            'Jenkins',
            'CircleCI',
            'Azure DevOps',
            'Not needed',
            'No preference'
        ]
    });

    // Testing & Quality questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Testing',
        text: 'What types of testing are required?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'Unit testing',
            'Integration testing',
            'E2E testing',
            'Performance testing',
            'Security testing',
            'Basic testing only'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'Testing',
        text: 'Code quality and linting preferences?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'ESLint/Prettier',
            'SonarQube',
            'Code coverage requirements',
            'Pre-commit hooks',
            'Basic linting only',
            'No preference'
        ]
    });

    // Performance & Scalability questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Performance',
        text: 'Caching strategy?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'Redis',
            'Memcached',
            'CDN caching',
            'Browser caching',
            'Not needed',
            'No preference'
        ]
    });

    questions.push({
        id: `dev${idCounter++}`,
        category: 'Performance',
        text: 'Expected concurrent users?',
        priority: 3,
        allowMultiple: false,
        optional: true,
        suggestedAnswers: [
            '< 100',
            '100-1,000',
            '1,000-10,000',
            '10,000-100,000',
            '> 100,000',
            'Not sure'
        ]
    });

    // Security questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Security',
        text: 'Specific security requirements?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'HTTPS/TLS',
            'Data encryption at rest',
            'GDPR compliance',
            'HIPAA compliance',
            'SOC 2 compliance',
            'Penetration testing',
            'Standard security practices'
        ]
    });

    // Monitoring & Logging questions
    questions.push({
        id: `dev${idCounter++}`,
        category: 'Monitoring',
        text: 'Monitoring and logging requirements?',
        priority: 3,
        allowMultiple: true,
        optional: true,
        suggestedAnswers: [
            'Application monitoring (APM)',
            'Error tracking (Sentry, etc.)',
            'Log aggregation',
            'Metrics and dashboards',
            'Alerting system',
            'Basic logging only',
            'No preference'
        ]
    });

    return questions;
}

/**
 * Check if user wants to answer developer questions
 */
async function shouldAskDeveloperQuestions(prompter) {
    logger.newline();
    logger.section('Optional: Developer/Technical Questions');
    console.log('These questions help specify technical implementation details.');
    console.log('Non-technical users can skip this section.\n');

    return await prompter.confirm(
        'Would you like to answer technical/developer questions?',
        false
    );
}

module.exports = {
    generateDeveloperQuestions,
    shouldAskDeveloperQuestions
};

// Made with Bob
