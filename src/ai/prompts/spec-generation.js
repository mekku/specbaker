/**
 * Specification Generation Prompts
 * 
 * Prompts for generating each section of the specification.
 * These can be fine-tuned independently for better results.
 */

/**
 * Base context template used in all section prompts
 */
/**
 * Base context template used in all section prompts
 */
const BASE_CONTEXT = `
You are an expert Systems Analyst conducting a requirements clarification session.

Based on the provided context, generate a clarified, implementation-ready specification for the requested section.

Your goal is to help the development team or AI developer agent understand what needs to be built, why it is needed, how it should behave, and what conditions must be satisfied for the work to be considered complete.

Instructions:
- Stay aligned with the given goal, domain, complexity, and user answers.
- Do not invent unrelated features or expand the scope unnecessarily.
- Clarify vague or incomplete requirements into practical development specifications.
- If important information is missing, make a reasonable assumption only when it is safe and useful for implementation.
- Clearly label inferred details as Assumptions.
- If a detail should not be guessed, list it as an Open Question.
- If there are technical, UX, business, security, scalability, or implementation concerns, add them as Remarks.
- Prefer specific, testable, and actionable wording.
- Avoid generic statements unless the context is also generic.
- If the provided information is insufficient, improvise a sensible baseline that supports the development goal.

Goal: {goal}
Domain: {domain}
Complexity: {complexity}

User answers:
{answersByCategory}
`;

/**
 * Section-specific prompts
 */
const SECTION_PROMPTS = {
    'Product Summary': `${BASE_CONTEXT}

Generate a Product Summary section that includes:
- Clear product goal statement
- Problem being solved
- Target users
- Core use cases
- Success criteria
- Key value propositions
- Scope summary
- Assumptions, open questions, and remarks if needed

Format as markdown with clear structure. Be specific, practical, and actionable.`,

    'User Roles': `${BASE_CONTEXT}

Generate a User Roles section that includes:
- Primary user types
- Secondary user types
- User personas with practical descriptions
- Permissions and access levels
- Responsibilities of each role
- Role-based limitations
- Admin or operator roles if applicable
- Assumptions, open questions, and remarks if needed

Format as markdown with tables or structured lists. Include specific details about each role.`,

    'Access & Deployment': `${BASE_CONTEXT}

Generate an Access & Deployment section that includes:
- How users will access the application, such as web, mobile, desktop, API, or internal tools
- Deployment model, such as cloud, on-premises, hybrid, or local development
- Runtime and hosting expectations
- Technical requirements
- Platform support, including browsers, operating systems, and devices
- Browser and device compatibility
- Authentication and access control expectations
- Network requirements
- Environment requirements, such as development, staging, and production
- Assumptions, open questions, and remarks if needed

Format as markdown with clear subsections.`,

    'Core Requirements': `${BASE_CONTEXT}

Generate a Core Requirements section that includes:
- Functional requirements as numbered items with clear descriptions
- Non-functional requirements, including performance, security, scalability, reliability, usability, and maintainability
- Technical constraints
- Integration requirements
- Data requirements
- Validation rules
- Error handling requirements
- Acceptance criteria for major requirements
- Assumptions, open questions, and remarks if needed

Format as markdown with clear categorization. Each requirement should be specific and testable.`,

    'Important Decisions': `${BASE_CONTEXT}

Generate an Important Decisions section that includes:
- Key product, technical, and architectural decisions
- Rationale for each decision
- Technology choices and why they are appropriate
- Trade-offs and implications
- Design patterns to use
- Security-related decisions
- Scalability-related decisions
- Maintainability considerations
- Decisions that still need confirmation
- Assumptions, open questions, and remarks if needed

Format as markdown using decision records. Each decision should explain the reasoning clearly.`,

    'User Journey / Workflow': `${BASE_CONTEXT}

Generate a User Journey / Workflow section that includes:
- Step-by-step user flows for the main features
- Key user interactions and system responses
- Touchpoints between users, system, and external services
- Decision points in the flow
- Alternative paths
- Edge cases and error handling
- Success scenarios
- Failure scenarios
- Assumptions, open questions, and remarks if needed

Format as markdown with numbered steps or flowchart-style descriptions. Be detailed and specific.`,

    'Data Model': `${BASE_CONTEXT}

Generate a Data Model section that includes:
- Main entities or objects in the system
- Key attributes for each entity
- Suggested data types and formats
- Relationships between entities, such as one-to-one, one-to-many, and many-to-many
- Required fields and optional fields
- Data constraints and validations
- Indexes, keys, and uniqueness rules
- Ownership, permission, or tenant boundaries if applicable
- Data lifecycle notes, such as creation, update, archive, or deletion
- Assumptions, open questions, and remarks if needed

Format as markdown with tables or structured lists. Include entity relationship descriptions.`,

    'UI Screen Outline': `${BASE_CONTEXT}

Generate a UI Screen Outline section that includes:
- List of all screens or pages in the application
- Purpose of each screen
- Key components on each screen
- Primary user actions on each screen
- Navigation flow between screens
- Screen wireframe descriptions in text form
- Empty, loading, error, and success states
- Responsive design considerations
- Permission-based UI differences if applicable
- Assumptions, open questions, and remarks if needed

Format as markdown with clear hierarchy. Describe each screen in practical implementation detail.`,

    'Test Scenarios': `${BASE_CONTEXT}

Generate a Test Scenarios section that includes:
- Critical test cases for main features
- Edge cases to test
- Acceptance criteria for each major feature
- Performance test scenarios
- Security test scenarios
- Integration test scenarios
- User acceptance test scenarios
- Negative test cases
- Regression test considerations
- Assumptions, open questions, and remarks if needed

Format as markdown with numbered test cases. Each test should include clear steps and expected results.`,

    'Implementation Plan': `${BASE_CONTEXT}

Generate an Implementation Plan section that includes:
- Development phases, such as Phase 1, Phase 2, Phase 3
- Features to implement in each phase
- Priority order and rationale
- Dependencies between features
- Suggested development sequence
- Estimated timeline or relative effort for each phase
- Milestones and deliverables
- Risk mitigation strategies
- MVP scope and later enhancements
- Assumptions, open questions, and remarks if needed

Format as markdown with clear phases. Be realistic, practical, and suitable for actual development planning.`,

    'AI Initial Prompt': `${BASE_CONTEXT}

Generate an AI-Ready Initial Prompt section.

The output must be a complete, copy-paste ready prompt for IBM Bob or another AI developer agent.

The prompt must include:
- Project overview and context
- Product goal
- Target users
- Functional requirements
- Non-functional requirements
- Technical specifications and constraints
- Suggested architecture
- Data model summary
- UI expectations
- User workflow expectations
- Implementation guidance and best practices
- Security and permission requirements
- Success criteria and acceptance criteria
- Testing requirements
- Documentation requirements
- Assumptions
- Open questions
- Remarks or risks

The prompt should guide the AI agent to start implementation immediately while avoiding unnecessary scope expansion.

Format as a single, well-structured prompt inside a markdown code block.
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

    // Format answers for better readability
    const allAnswersFormatted = context.allAnswers
        ? JSON.stringify(context.allAnswers, null, 2)
        : 'No answers provided yet';

    const answersByCategoryFormatted = context.answersByCategory
        ? JSON.stringify(context.answersByCategory, null, 2)
        : 'No categorized answers yet';

    return template
        .replace('{goal}', context.goal || 'Not specified')
        .replace('{domain}', context.analysis?.domain || 'general')
        .replace('{complexity}', context.analysis?.complexity || 'moderate')
        .replace('{allAnswers}', allAnswersFormatted)
        .replace('{answersByCategory}', answersByCategoryFormatted);
}

/**
 * Prompt configuration for spec generation
 */
const SPEC_GENERATION_CONFIG = {
    temperature: 0.4,
    maxTokens: 10000,
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
