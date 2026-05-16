/**
 * Specification Generation Prompts
 * 
 * Prompts for generating each section of the specification.
 * These can be fine-tuned independently for better results.
 */

/**
 * Base context template used in all section prompts
 */
const BASE_CONTEXT = `
Goal: {goal}
Domain: {domain}
Complexity: {complexity}

User Answers:
{answers}
`;

/**
 * Section-specific prompts
 */
const SECTION_PROMPTS = {
    'Product Summary': `${BASE_CONTEXT}

Generate a Product Summary section that includes:
- Clear goal statement
- Problem being solved
- Target users
- Success criteria
- Key value propositions

Format as markdown with clear structure. Be specific and actionable.`,

    'User Roles': `${BASE_CONTEXT}

Generate a User Roles section that includes:
- Primary user types
- Secondary user types
- User personas with descriptions
- User permissions and access levels
- User responsibilities

Format as markdown with tables or lists. Include specific details about each role.`,

    'Access & Deployment': `${BASE_CONTEXT}

Generate an Access & Deployment section that includes:
- How users will access the application (web, mobile, desktop, API)
- Deployment model (cloud, on-premises, hybrid)
- Technical requirements
- Platform support (browsers, OS, devices)
- Browser/device compatibility
- Network requirements

Format as markdown with clear subsections.`,

    'Core Requirements': `${BASE_CONTEXT}

Generate a Core Requirements section that includes:
- Functional requirements (numbered list with clear descriptions)
- Non-functional requirements (performance, security, scalability, reliability)
- Technical constraints
- Integration requirements
- Data requirements

Format as markdown with clear categorization. Each requirement should be specific and testable.`,

    'Important Decisions': `${BASE_CONTEXT}

Generate an Important Decisions section that includes:
- Key architectural decisions with rationale
- Technology choices and why they were selected
- Trade-offs made and their implications
- Design patterns to use
- Security decisions
- Scalability decisions

Format as markdown with decision records. Each decision should explain the reasoning.`,

    'User Journey / Workflow': `${BASE_CONTEXT}

Generate a User Journey section that includes:
- Step-by-step user flows for main features
- Key interactions and touchpoints
- Decision points in the flow
- Edge cases and error handling
- Alternative paths
- Success and failure scenarios

Format as markdown with numbered steps or flowchart descriptions. Be detailed and specific.`,

    'Data Model': `${BASE_CONTEXT}

Generate a Data Model section that includes:
- Main entities/objects in the system
- Key attributes for each entity
- Relationships between entities (one-to-one, one-to-many, many-to-many)
- Data constraints and validations
- Data types and formats
- Indexes and keys

Format as markdown with tables or structured lists. Include entity relationship descriptions.`,

    'UI Screen Outline': `${BASE_CONTEXT}

Generate a UI Screen Outline section that includes:
- List of all screens/pages in the application
- Key components on each screen
- Navigation flow between screens
- Screen wireframe descriptions
- User interactions on each screen
- Responsive design considerations

Format as markdown with clear hierarchy. Describe each screen in detail.`,

    'Test Scenarios': `${BASE_CONTEXT}

Generate a Test Scenarios section that includes:
- Critical test cases for main features
- Edge cases to test
- Acceptance criteria for each feature
- Performance test scenarios
- Security test scenarios
- Integration test scenarios
- User acceptance test scenarios

Format as markdown with numbered test cases. Each test should have clear steps and expected results.`,

    'Implementation Plan': `${BASE_CONTEXT}

Generate an Implementation Plan section that includes:
- Development phases (Phase 1, 2, 3, etc.)
- Features to implement in each phase
- Priority order and rationale
- Dependencies between features
- Estimated timeline for each phase
- Milestones and deliverables
- Risk mitigation strategies

Format as markdown with clear phases. Be realistic and practical.`,

    'Bob-Ready Prompt': `${BASE_CONTEXT}

Generate a Bob-Ready Prompt section that includes:
A complete, copy-paste ready prompt for IBM Bob that contains:
- Project overview and context
- All functional requirements
- All non-functional requirements
- Technical specifications and constraints
- Implementation guidance and best practices
- Success criteria and acceptance criteria
- Testing requirements
- Documentation requirements

This should be a comprehensive prompt that Bob can use to start implementation immediately.
Format as a single, well-structured prompt in a code block.
Make it detailed, specific, and actionable.`
};

/**
 * Get prompt for a specific section
 */
function getSectionPrompt(sectionName, context) {
    const template = SECTION_PROMPTS[sectionName];
    if (!template) {
        throw new Error(`No prompt template found for section: ${sectionName}`);
    }

    return template
        .replace('{goal}', context.goal || '')
        .replace('{domain}', context.analysis?.domain || 'general')
        .replace('{complexity}', context.analysis?.complexity || 'moderate')
        .replace('{answers}', JSON.stringify(context.answers || {}, null, 2));
}

/**
 * Prompt configuration for spec generation
 */
const SPEC_GENERATION_CONFIG = {
    temperature: 0.4,
    maxTokens: 2000,
    topP: 0.9,
    topK: 50
};

/**
 * Get all available section names
 */
function getAvailableSections() {
    return Object.keys(SECTION_PROMPTS);
}

module.exports = {
    SECTION_PROMPTS,
    getSectionPrompt,
    SPEC_GENERATION_CONFIG,
    getAvailableSections
};

// Made with Bob
