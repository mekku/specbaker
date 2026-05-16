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
    { name: 'Bob-Ready Prompt', key: 'bobPrompt' }
];

class SpecEngine {
    constructor(watsonxClient, context) {
        this.watsonxClient = watsonxClient;
        this.context = context;
        this.generatedSections = {};
    }

    /**
     * Generate complete specification
     */
    async generateSpec() {
        logger.section('Generating Specification');
        logger.info('Creating comprehensive specification from your answers...\n');

        const spinner = ora('Preparing specification generation...').start();

        try {
            // Export context for generation
            const contextData = this.context.exportForSpecGeneration();

            spinner.succeed('Context prepared');

            // Generate each section
            for (let i = 0; i < SPEC_SECTIONS.length; i++) {
                const section = SPEC_SECTIONS[i];

                spinner.start(`Generating ${section.name} (${i + 1}/${SPEC_SECTIONS.length})...`);

                try {
                    const content = await this.generateSection(section.name, contextData);
                    this.generatedSections[section.key] = content;

                    spinner.succeed(`${section.name} generated`);
                } catch (error) {
                    spinner.warn(`${section.name} generation failed, using template`);
                    logger.debug(`Error generating ${section.name}:`, error);

                    // Use fallback template
                    this.generatedSections[section.key] = this.getFallbackContent(section.name, contextData);
                }

                // Small delay to avoid rate limiting
                await this.delay(500);
            }

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

        // Generate content using AI (prompt is handled in watsonx-client)
        const content = await this.watsonxClient.generateSection(sectionName, contextData);

        // Validate and clean content
        const validated = this.validateSection(sectionName, content);

        return validated;
    }


    /**
     * Validate section content
     */
    validateSection(sectionName, content) {
        if (!content || content.trim().length === 0) {
            throw new Error(`Empty content generated for ${sectionName}`);
        }

        // Ensure content is not too short
        if (content.length < 100) {
            logger.warn(`Section ${sectionName} seems too short (${content.length} chars)`);
        }

        // Clean up content
        let cleaned = content.trim();

        // Ensure section has a heading
        if (!cleaned.startsWith('#')) {
            cleaned = `## ${sectionName}\n\n${cleaned}`;
        }

        return cleaned;
    }

    /**
     * Get fallback content for a section
     */
    getFallbackContent(sectionName, contextData) {
        const templates = {
            'Product Summary': `## Product Summary

**Goal:** ${contextData.goal}

**Problem Being Solved:**
This application addresses the need for ${contextData.goal.toLowerCase()}.

**Target Users:**
${contextData.analysis.extractedInfo?.users?.join(', ') || 'End users'}

**Success Criteria:**
- User adoption and engagement
- Feature completeness
- Performance and reliability
- User satisfaction`,

            'User Roles': `## User Roles

### Primary Users
- End Users: Main users of the application
- Administrators: Manage system settings and users

### User Permissions
- End Users: Read and write access to their own data
- Administrators: Full system access`,

            'Access & Deployment': `## Access & Deployment

**Access Method:**
Users will access the application via ${contextData.analysis.domain === 'web' ? 'web browser' : 'appropriate platform'}.

**Deployment Model:**
Cloud-based deployment for scalability and accessibility.

**Technical Requirements:**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Responsive design for mobile devices`,

            'Core Requirements': `## Core Requirements

### Functional Requirements
1. User authentication and authorization
2. Core feature implementation based on user needs
3. Data management and storage
4. User interface for all main features

### Non-Functional Requirements
- **Performance:** Fast response times (< 2 seconds)
- **Security:** Secure data handling and authentication
- **Scalability:** Support growing user base
- **Reliability:** 99.9% uptime`,

            'Important Decisions': `## Important Decisions

### Technology Stack
- Modern, maintainable technology choices
- Industry-standard frameworks and libraries
- Cloud-native architecture

### Design Patterns
- RESTful API design
- Component-based UI architecture
- Separation of concerns`,

            'User Journey / Workflow': `## User Journey / Workflow

### Main User Flow
1. User accesses the application
2. User authenticates (if required)
3. User navigates to desired feature
4. User performs actions
5. System provides feedback
6. User completes task`,

            'Data Model': `## Data Model

### Main Entities
- **User:** User account information
- **Data:** Core application data
- **Settings:** User and system settings

### Relationships
- Users have associated data
- Data belongs to users
- Settings are user-specific`,

            'UI Screen Outline': `## UI Screen Outline

### Main Screens
1. **Home/Dashboard:** Overview and quick actions
2. **Feature Screens:** Main functionality
3. **Settings:** User preferences
4. **Profile:** User account management

### Navigation
- Top navigation bar
- Sidebar for main sections
- Breadcrumbs for deep navigation`,

            'Test Scenarios': `## Test Scenarios

### Critical Test Cases
1. User authentication flow
2. Main feature functionality
3. Data creation and modification
4. Error handling
5. Edge cases

### Acceptance Criteria
- All features work as specified
- No critical bugs
- Performance meets requirements
- Security measures in place`,

            'Implementation Plan': `## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- Set up development environment
- Implement authentication
- Create basic UI structure

### Phase 2: Core Features (Weeks 3-4)
- Implement main features
- Add data management
- Create user interfaces

### Phase 3: Polish & Testing (Weeks 5-6)
- Bug fixes and refinements
- Performance optimization
- User testing and feedback

### Phase 4: Deployment (Week 7)
- Production deployment
- Monitoring setup
- Documentation`,

            'Bob-Ready Prompt': `## Bob-Ready Prompt

\`\`\`
Build an application with the following specifications:

Goal: ${contextData.goal}

Requirements:
- Implement core functionality as described
- Create user-friendly interface
- Ensure security and performance
- Follow best practices

Technical Stack:
- Use modern, maintainable technologies
- Implement proper error handling
- Add comprehensive testing

Deliverables:
- Working application
- Clean, documented code
- Deployment instructions
- User documentation

Please implement this step by step, starting with the foundation and building up to the complete application.
\`\`\`
`
        };

        return templates[sectionName] || `## ${sectionName}\n\n[Content to be added]`;
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
