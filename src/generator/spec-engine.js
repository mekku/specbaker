/**
 * Spec Generation Engine
 * 
 * Orchestrates the generation of all specification sections using AI.
 */

const { getLogger } = require('../utils/logger');
const ora = require('ora');

const logger = getLogger();

// Define all specification sections in order
const SPEC_SECTIONS = [
    { name: 'Product Summary', key: 'productSummary' },
    { name: 'User Roles', key: 'userRoles' },
    { name: 'Access & Deployment', key: 'accessDeployment' },
    { name: 'Core Requirements', key: 'coreRequirements' },
    { name: 'Important Decisions', key: 'importantDecisions' },
    { name: 'User Journey / Workflow', key: 'userJourney' },
    { name: 'Data Model', key: 'dataModel' },
    { name: 'UI Screen Outline', key: 'uiScreens' },
    { name: 'Test Scenarios', key: 'testScenarios' },
    { name: 'Implementation Plan', key: 'implementationPlan' },
];

class SpecEngine {
    constructor(watsonxClient, context) {
        this.watsonxClient = watsonxClient;
        this.context = context;
        this.generatedSections = {};
    }

    /**
     * Generate complete specification with parallel processing
     */
    async generateSpec() {
        logger.section('Generating Specification');
        logger.info('Creating comprehensive specification from your answers...\n');

        const spinner = ora('Preparing specification generation...').start();

        try {
            // Export context for generation
            const contextData = this.context.exportForSpecGeneration();

            spinner.succeed('Context prepared');

            // Group sections by dependency level for parallel generation
            const independentSections = [
                'Product Summary',
                'User Roles',
                'Access & Deployment',
                'Core Requirements',
                'Important Decisions'
            ];

            const dependentSections = [
                'User Journey / Workflow',
                'Data Model',
                'UI Screen Outline',
                'Test Scenarios',
                'Implementation Plan',
                'Bob-Ready Prompt'
            ];

            // Generate independent sections in parallel (batch of 3 at a time to avoid rate limits)
            spinner.start('Generating independent sections in parallel...');
            await this.generateSectionsInBatches(independentSections, contextData, 3);
            spinner.succeed(`Generated ${independentSections.length} independent sections`);

            // Generate dependent sections in parallel (batch of 2 at a time)
            spinner.start('Generating dependent sections...');
            await this.generateSectionsInBatches(dependentSections, contextData, 2);
            spinner.succeed(`Generated ${dependentSections.length} dependent sections`);

            spinner.succeed('All sections generated successfully!');

            return {
                sections: this.generatedSections,
                metadata: {
                    generatedAt: new Date().toISOString(),
                    sectionsCount: SPEC_SECTIONS.length,
                    context: contextData.summary
                }
            };

        } catch (error) {
            spinner.fail('Specification generation failed');
            throw error;
        }
    }

    /**
     * Generate a single section
     */
    async generateSection(sectionName, contextData) {
        logger.debug(`Generating section: ${sectionName}`);

        try {
            // Generate content using AI (prompt is handled in watsonx-client)
            const content = await this.watsonxClient.generateSection(sectionName, contextData);

            logger.debug(`Received content for ${sectionName}: ${content ? content.substring(0, 100) : 'NULL'}...`);

            // Validate and clean content
            const validated = this.validateSection(sectionName, content);

            return validated;
        } catch (error) {
            logger.error(`Error generating ${sectionName}: ${error.message}`);
            logger.debug(`Full error:`, error);
            throw error;
        }
    }


    /**
     * Validate section content
     */
    validateSection(sectionName, content) {
        // Check if content exists
        if (!content) {
            logger.error(`AI returned null/undefined for ${sectionName}`);
            throw new Error(`No content generated for ${sectionName}. AI may have failed to respond.`);
        }

        // Check if content is empty after trimming
        const trimmed = content.trim();
        if (trimmed.length === 0) {
            logger.error(`AI returned empty string for ${sectionName}`);
            throw new Error(`Empty content generated for ${sectionName}. AI response was blank.`);
        }

        // Ensure content is not too short (likely an error message or incomplete response)
        if (trimmed.length < 50) {
            logger.warn(`Section ${sectionName} is very short (${trimmed.length} chars): "${trimmed}"`);
            logger.warn('This may indicate an AI generation issue. Consider checking your prompts.');
        }

        // Clean up content
        let cleaned = trimmed;

        // Ensure section has a heading
        if (!cleaned.startsWith('#')) {
            cleaned = `## ${sectionName}\n\n${cleaned}`;
        }

        return cleaned;
    }

    /**
     * Create placeholder content when AI generation fails
     */
    createPlaceholderSection(sectionName, contextData) {
        const warning = `> ⚠️ **AI GENERATION FAILED** - This section contains placeholder content based on your answers.
> Please review and complete this section manually with specific details for your project.

`;

        const templates = {
            'Product Summary': `## Product Summary

${warning}
**Goal:** ${contextData.goal}

**Problem Being Solved:**
This application addresses the need for ${contextData.goal.toLowerCase()}.

**Target Users:**
Based on your answers: ${JSON.stringify(contextData.allAnswers, null, 2)}

**Success Criteria:**
- User adoption and engagement
- Feature completeness
- Performance and reliability
- User satisfaction

**TODO:** Add specific success metrics and KPIs`,

            'User Roles': `## User Roles

${warning}
### Primary Users
Based on your answers, identify and describe each user role:

${JSON.stringify(contextData.answersByCategory['User & Audience'] || [], null, 2)}

**TODO:**
- Define specific user roles
- Describe permissions for each role
- Add user personas with details`,

            'Access & Deployment': `## Access & Deployment

${warning}
**Access Method:**
Users will access the application via ${contextData.analysis?.domain === 'web' ? 'web browser' : 'appropriate platform'}.

**Deployment Model:**
Cloud-based deployment for scalability and accessibility.

**Technical Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Responsive design for mobile devices

**TODO:** Specify exact deployment requirements and platform details`,

            'Core Requirements': `## Core Requirements

${warning}
### Functional Requirements
Based on your answers about features:
${JSON.stringify(contextData.answersByCategory['Core Functionality'] || [], null, 2)}

**TODO:**
1. List specific functional requirements
2. Add non-functional requirements (performance, security, scalability)
3. Define technical constraints
4. Specify integration requirements

### Non-Functional Requirements
- **Performance:** Fast response times (< 2 seconds)
- **Security:** Secure data handling and authentication
- **Scalability:** Support growing user base
- **Reliability:** 99.9% uptime`,

            'Important Decisions': `## Important Decisions

${warning}
### Technology Stack
Based on your requirements, consider:
- Modern, maintainable technology choices
- Industry-standard frameworks and libraries
- Cloud-native architecture

**TODO:** Make specific technology decisions based on your constraints and team expertise`,

            'User Journey / Workflow': `## User Journey / Workflow

${warning}
### Main User Flow
Based on your core features:
${JSON.stringify(contextData.answersByCategory['Core Functionality'] || [], null, 2)}

**TODO:**
1. Map out detailed user journeys for each main feature
2. Include decision points and alternative paths
3. Add error handling scenarios`,

            'Data Model': `## Data Model

${warning}
### Main Entities
Based on your application needs, identify:
- Core data entities
- Their attributes
- Relationships between entities

**TODO:** Create detailed data model with specific fields and relationships`,

            'UI Screen Outline': `## UI Screen Outline

${warning}
### Main Screens
Based on your features and user roles:
${JSON.stringify(contextData.allAnswers, null, 2)}

**TODO:**
1. List all screens/pages
2. Describe layout and components for each
3. Define navigation flow`,

            'Test Scenarios': `## Test Scenarios

${warning}
### Critical Test Cases
Based on your core requirements:
1. Test main features
2. Test user workflows
3. Test edge cases
4. Test error handling

**TODO:** Write specific test scenarios with expected outcomes`,

            'Implementation Plan': `## Implementation Plan

${warning}
### Suggested Phases
**Phase 1: Foundation**
- Set up development environment
- Implement authentication
- Create basic UI structure

**Phase 2: Core Features**
- Implement main features
- Add data management

**Phase 3: Polish & Testing**
- Bug fixes and refinements
- Performance optimization
- User testing and feedback

**TODO:** Adjust timeline based on team size and complexity`,

            'Bob-Ready Prompt': `## Bob-Ready Prompt

${warning}
\`\`\`
Build an application with the following specifications:

Goal: ${contextData.goal}

User Answers:
${JSON.stringify(contextData.allAnswers, null, 2)}

Requirements:
- Implement core functionality as described
- Create user-friendly interface
- Ensure security and performance
- Follow best practices

**TODO:** Complete this prompt with specific technical requirements, constraints, and deliverables from the other sections of this specification.

Please implement this step by step, starting with the foundation and building up to the complete application.
\`\`\`
`
        };

        return templates[sectionName] || `## ${sectionName}

${warning}
This section could not be generated by AI.

**Context:**
- Goal: ${contextData.goal}
- User Answers: ${JSON.stringify(contextData.allAnswers, null, 2)}

**TODO:** Manually complete this section based on your project requirements.`;
    }

    /**
     * Generate sections in parallel batches
     */
    async generateSectionsInBatches(sectionNames, contextData, batchSize) {
        const results = [];

        // Process in batches to avoid overwhelming the API
        for (let i = 0; i < sectionNames.length; i += batchSize) {
            const batch = sectionNames.slice(i, i + batchSize);

            // Generate batch in parallel
            const batchPromises = batch.map(async (sectionName) => {
                const section = SPEC_SECTIONS.find(s => s.name === sectionName);
                if (!section) return null;

                try {
                    logger.info(`⏳ Generating ${sectionName}...`);
                    const content = await this.generateSection(sectionName, contextData);
                    this.generatedSections[section.key] = content;
                    logger.success(`✓ ${sectionName} generated`);
                    return { section: sectionName, success: true };
                } catch (error) {
                    logger.warn(`⚠ ${sectionName} generation failed - using placeholder`);
                    logger.debug(`Error: ${error.message}`);
                    this.generatedSections[section.key] = this.createPlaceholderSection(sectionName, contextData);
                    return { section: sectionName, success: false, error: error.message };
                }
            });

            // Wait for batch to complete
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults.filter(r => r !== null));

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < sectionNames.length) {
                await this.delay(1000);
            }
        }

        return results;
    }

    /**
     * Get section dependencies
     */
    getSectionDependencies(sectionName) {
        const dependencies = {
            'User Journey / Workflow': ['User Roles', 'Core Requirements'],
            'Data Model': ['Core Requirements'],
            'UI Screen Outline': ['User Journey / Workflow'],
            'Test Scenarios': ['Core Requirements', 'User Journey / Workflow'],
            'Implementation Plan': ['Core Requirements', 'Important Decisions'],
            'Bob-Ready Prompt': ['Product Summary', 'Core Requirements', 'Implementation Plan']
        };

        return dependencies[sectionName] || [];
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get generation progress
     */
    getProgress() {
        const total = SPEC_SECTIONS.length;
        const completed = Object.keys(this.generatedSections).length;
        return {
            total,
            completed,
            percentage: Math.round((completed / total) * 100)
        };
    }
}

module.exports = SpecEngine;

// Made with Bob
