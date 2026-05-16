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

        // Get section-specific prompt
        const prompt = this.getSectionPrompt(sectionName, contextData);

        // Generate content using AI
        const content = await this.watsonxClient.generateSection(sectionName, {
            goal: contextData.goal,
            analysis: contextData.analysis,
            answers: contextData.answersByCategory,
            decisions: contextData.decisions,
            prompt
        });

        // Validate and clean content
        const validated = this.validateSection(sectionName, content);

        return validated;
    }

    /**
     * Get section-specific prompt
     */
    getSectionPrompt(sectionName, contextData) {
        const baseContext = `
Goal: ${contextData.goal}
Domain: ${contextData.analysis.domain}
Complexity: ${contextData.analysis.complexity}

User Answers:
${JSON.stringify(contextData.answersByCategory, null, 2)}
`;

        const prompts = {
            'Product Summary': `${baseContext}

Generate a Product Summary section that includes:
- Clear goal statement
- Problem being solved
- Target users
- Success criteria
- Key value propositions

Format as markdown with clear structure.`,

            'User Roles': `${baseContext}

Generate a User Roles section that includes:
- Primary user types
- Secondary user types
- User personas with descriptions
- User permissions and access levels

Format as markdown with tables or lists.`,

            'Access & Deployment': `${baseContext}

Generate an Access & Deployment section that includes:
- How users will access the application
- Deployment model (cloud, on-premises, hybrid)
- Technical requirements
- Platform support
- Browser/device compatibility

Format as markdown.`,

            'Core Requirements': `${baseContext}

Generate a Core Requirements section that includes:
- Functional requirements (numbered list)
- Non-functional requirements (performance, security, scalability)
- Technical constraints
- Integration requirements

Format as markdown with clear categorization.`,

            'Important Decisions': `${baseContext}

Generate an Important Decisions section that includes:
- Key architectural decisions
- Technology choices and rationale
- Trade-offs made
- Design patterns to use

Format as markdown with decision records.`,

            'User Journey / Workflow': `${baseContext}

Generate a User Journey section that includes:
- Step-by-step user flows for main features
- Key interactions
- Decision points
- Edge cases and error handling

Format as markdown with numbered steps or flowchart descriptions.`,

            'Data Model': `${baseContext}

Generate a Data Model section that includes:
- Main entities/objects
- Key attributes for each entity
- Relationships between entities
- Data constraints and validations

Format as markdown with tables or structured lists.`,

            'UI Screen Outline': `${baseContext}

Generate a UI Screen Outline section that includes:
- List of all screens/pages
- Key components on each screen
- Navigation flow between screens
- Screen wireframe descriptions

Format as markdown with clear hierarchy.`,

            'Test Scenarios': `${baseContext}

Generate a Test Scenarios section that includes:
- Critical test cases for main features
- Edge cases to test
- Acceptance criteria
- Performance test scenarios
- Security test scenarios

Format as markdown with numbered test cases.`,

            'Implementation Plan': `${baseContext}

Generate an Implementation Plan section that includes:
- Development phases (Phase 1, 2, 3, etc.)
- Features in each phase
- Priority order
- Dependencies between features
- Estimated timeline

Format as markdown with clear phases.`,

            'Bob-Ready Prompt': `${baseContext}

Generate a Bob-Ready Prompt section that includes:
A complete, copy-paste ready prompt for IBM Bob that contains:
- Project overview
- All requirements
- Technical specifications
- Implementation guidance
- Success criteria

This should be a comprehensive prompt that Bob can use to start implementation immediately.
Format as a single, well-structured prompt in a code block.`
        };

        return prompts[sectionName] || baseContext;
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
