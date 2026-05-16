# Prompt Customization Guide

## Overview

SpecBaker now stores all AI prompts in separate, easily editable files. This makes it simple to fine-tune prompts for better results without modifying the core code.

## Prompt Files Location

All prompts are located in `src/ai/prompts/`:

```
src/ai/prompts/
├── goal-analysis.js       # Prompts for analyzing user goals
├── question-generation.js # Prompts for generating questions
└── spec-generation.js     # Prompts for generating spec sections
```

## Customizing Prompts

### 1. Goal Analysis Prompts

**File:** `src/ai/prompts/goal-analysis.js`

**Purpose:** Analyzes the user's initial goal to extract intent, domain, complexity, and generate initial questions.

**How to customize:**
```javascript
// Edit the GOAL_ANALYSIS_PROMPT constant
const GOAL_ANALYSIS_PROMPT = `Your custom prompt here...`;

// Adjust AI parameters
const GOAL_ANALYSIS_CONFIG = {
  temperature: 0.3,  // Lower = more focused, Higher = more creative
  maxTokens: 800,    // Maximum response length
  topP: 0.9,
  topK: 50
};
```

**Tips for customization:**
- Add domain-specific keywords to improve detection
- Adjust temperature for more/less creative analysis
- Add examples for better JSON formatting
- Include industry-specific terminology

### 2. Question Generation Prompts

**File:** `src/ai/prompts/question-generation.js`

**Purpose:** Generates clarifying questions based on the goal analysis.

**How to customize:**
```javascript
// Edit the QUESTION_GENERATION_PROMPT constant
const QUESTION_GENERATION_PROMPT = `Your custom prompt here...`;

// Adjust AI parameters
const QUESTION_GENERATION_CONFIG = {
  temperature: 0.5,  // Slightly higher for varied questions
  maxTokens: 1000,
  topP: 0.9,
  topK: 50
};
```

**Tips for customization:**
- Add specific question categories for your domain
- Include examples of good questions
- Specify the `allowMultiple` flag for appropriate questions
- Add constraints for question format

### 3. Specification Generation Prompts

**File:** `src/ai/prompts/spec-generation.js`

**Purpose:** Generates each of the 11 specification sections.

**How to customize:**

Each section has its own prompt in the `SECTION_PROMPTS` object:

```javascript
const SECTION_PROMPTS = {
  'Product Summary': `Your custom prompt...`,
  'User Roles': `Your custom prompt...`,
  // ... etc
};
```

**To customize a specific section:**

1. Open `src/ai/prompts/spec-generation.js`
2. Find the section you want to customize
3. Edit the prompt text
4. Save the file

**Example - Customizing Product Summary:**

```javascript
'Product Summary': `${BASE_CONTEXT}

Generate a Product Summary section that includes:
- Clear goal statement
- Problem being solved
- Target users
- Success criteria
- Key value propositions
- **YOUR CUSTOM REQUIREMENT HERE**

Format as markdown with clear structure. Be specific and actionable.
Include real-world examples where applicable.`,
```

**Adjust AI parameters:**
```javascript
const SPEC_GENERATION_CONFIG = {
  temperature: 0.4,  // Balanced creativity
  maxTokens: 2000,   // Longer responses for detailed sections
  topP: 0.9,
  topK: 50
};
```

## Advanced Customization

### Adding New Sections

To add a new specification section:

1. **Add to `SECTION_PROMPTS` in `spec-generation.js`:**
```javascript
'My New Section': `${BASE_CONTEXT}

Generate a "My New Section" that includes:
- Requirement 1
- Requirement 2
- Requirement 3

Format as markdown.`,
```

2. **Add to `SPEC_SECTIONS` in `spec-engine.js`:**
```javascript
const SPEC_SECTIONS = [
  // ... existing sections
  { name: 'My New Section', key: 'myNewSection' }
];
```

3. **Add fallback content in `spec-engine.js`:**
```javascript
'My New Section': `## My New Section

[Fallback content here]`
```

### Context Variables

All prompts have access to these context variables:

- `{goal}` - User's original goal
- `{domain}` - Detected domain (web, mobile, etc.)
- `{complexity}` - Complexity level (simple, moderate, complex)
- `{answers}` - All user answers as JSON

**Example usage:**
```javascript
const prompt = `
Goal: {goal}
Domain: {domain}

Based on this {complexity} project, generate...
`;
```

## Temperature Guide

Temperature controls randomness in AI responses:

| Temperature | Use Case | Example |
|-------------|----------|---------|
| 0.0 - 0.3 | Factual, structured | Goal analysis, data extraction |
| 0.3 - 0.5 | Balanced | Spec generation, requirements |
| 0.5 - 0.7 | Creative | Question generation, examples |
| 0.7 - 1.0 | Very creative | Brainstorming, alternatives |

## Best Practices

### 1. Be Specific
❌ Bad: "Generate requirements"
✅ Good: "Generate numbered functional requirements with clear acceptance criteria"

### 2. Provide Structure
❌ Bad: "Write about users"
✅ Good: "List user roles in a table with columns: Role, Description, Permissions"

### 3. Include Examples
```javascript
const prompt = `Generate questions in this format:

Example:
{
  "id": "q1",
  "text": "Who are the primary users?",
  "allowMultiple": true
}

Now generate 5 questions...`;
```

### 4. Request Specific Format
```javascript
const prompt = `Format your response as valid JSON only, no additional text.`;
```

### 5. Add Constraints
```javascript
const prompt = `Generate 3-5 questions (not more than 5).
Each question should be under 100 characters.
Focus on high-priority items only.`;
```

## Testing Your Changes

After customizing prompts:

1. **Test with a simple goal:**
```bash
specbaker generate "Build a todo app"
```

2. **Test with a complex goal:**
```bash
specbaker generate "Build an enterprise CRM system with AI-powered analytics"
```

3. **Check the output:**
- Is the analysis accurate?
- Are questions relevant?
- Are spec sections complete?

4. **Iterate:**
- Adjust temperature if responses are too random/rigid
- Add more examples if format is inconsistent
- Refine instructions if content is off-target

## Common Issues & Solutions

### Issue: Responses are too generic
**Solution:** Add more specific instructions and examples

### Issue: JSON parsing fails
**Solution:** Add explicit format instructions and examples

### Issue: Responses are too long/short
**Solution:** Adjust `maxTokens` parameter

### Issue: Responses are inconsistent
**Solution:** Lower temperature for more consistency

### Issue: Missing important details
**Solution:** Add explicit requirements in the prompt

## Version Control

When customizing prompts:

1. **Document your changes:**
```javascript
// Modified 2024-05-16: Added industry-specific terminology
// Reason: Better detection of healthcare projects
const GOAL_ANALYSIS_PROMPT = `...`;
```

2. **Test thoroughly** before committing

3. **Keep backups** of working prompts

4. **Share improvements** with the team

## Examples

### Example 1: Adding Domain-Specific Analysis

```javascript
// In goal-analysis.js
const GOAL_ANALYSIS_PROMPT = `Analyze this software goal...

Special considerations:
- If healthcare: Check for HIPAA compliance needs
- If finance: Check for security and audit requirements
- If e-commerce: Check for payment integration needs

...`;
```

### Example 2: Customizing Question Style

```javascript
// In question-generation.js
const QUESTION_GENERATION_PROMPT = `Generate questions in a friendly, conversational tone.

Instead of: "What is the deployment model?"
Use: "How would you like users to access your application?"

...`;
```

### Example 3: Adding Section Details

```javascript
// In spec-generation.js
'Data Model': `${BASE_CONTEXT}

Generate a detailed Data Model section with:
- Entity-Relationship diagram description
- Database schema suggestions
- Index recommendations
- Data migration considerations
- Backup and recovery strategy

...`,
```

## Need Help?

- Check existing prompts for examples
- Test changes incrementally
- Use `--debug` flag to see AI responses
- Refer to watsonx.ai documentation for model capabilities

---

**Remember:** Good prompts are:
- ✅ Clear and specific
- ✅ Well-structured
- ✅ Include examples
- ✅ Request specific formats
- ✅ Set appropriate constraints