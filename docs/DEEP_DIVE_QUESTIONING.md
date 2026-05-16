# Deep-Dive Questioning System

SpecBaker uses an unlimited deep-dive questioning approach, similar to how a Systems Analyst (SA) conducts requirements gathering sessions.

## How It Works

### 1. Priority-Based Questioning

Questions are assigned priorities and asked in order of importance:

- **Priority 1 (HIGH/CRITICAL)**: Essential questions asked first
  - Core functionality and main features
  - Primary users and target audience
  - Main problem being solved
  - Essential business goals
  - Critical technical constraints

- **Priority 2 (MEDIUM/IMPORTANT)**: Important details asked second
  - Specific feature details
  - Integration requirements
  - Performance expectations
  - Security and compliance needs
  - User experience details

- **Priority 3 (LOW/NICE-TO-HAVE)**: Optional details asked last
  - Optional features
  - Future enhancements
  - Analytics and reporting
  - Edge cases
  - Minor optimizations

### 2. Unlimited Rounds

Unlike traditional questionnaires with fixed limits, SpecBaker continues asking follow-up questions until:

1. **All concerns are addressed**: The AI determines no more clarification is needed
2. **User decides to stop**: You can stop at any time when you feel enough information has been gathered

You'll see this message throughout the process:
```
💡 You can stop the questioning at any time if you feel you've provided enough information.
```

### 3. Intelligent Follow-Ups

After each round of answers, the AI:

1. **Analyzes your responses** for vague or incomplete information
2. **Generates targeted follow-up questions** to clarify specific points
3. **Prioritizes follow-ups** based on importance
4. **Asks for confirmation** before continuing to the next round

Example flow:
```
Round 1: Initial questions (5-8 questions, priority 1 focus)
  ↓
Round 2: Follow-ups on vague answers (3-5 questions)
  ↓
Round 3: Deep-dive on specific features (2-4 questions)
  ↓
Round 4: Edge cases and constraints (1-3 questions)
  ↓
Continue until complete or user stops
```

## Multiple-Choice Detection

The system automatically detects when questions should allow multiple selections:

### Auto-Detection Keywords

Questions containing these patterns become multiple-choice:
- "top 3", "top 5", "top N"
- "which", "what are"
- "features", "platforms", "integrations"
- "select all", "choose multiple"
- "list the", "name the"

### Examples

**Single Choice:**
```
❓ What is the primary goal of this application?
→ User selects ONE answer
```

**Multiple Choice:**
```
❓ What are the top 3 most important features?
→ User can select MULTIPLE answers
```

## Best Practices

### For Users

1. **Be specific in initial answers**: Reduces follow-up rounds
2. **Don't rush**: Take time to think through each question
3. **Stop when ready**: You don't need to answer everything if you're unsure
4. **Provide context**: Explain "why" not just "what"

### For Developers

1. **Customize priority thresholds** in `src/ai/prompts/question-generation.js`
2. **Adjust follow-up sensitivity** in `src/generator/question-generator.js`
3. **Modify detection keywords** in `detectAllowMultiple()` method
4. **Fine-tune AI prompts** for your domain

## Configuration

### Adjust Question Limits

In `src/generator/question-generator.js`:

```javascript
constructor(watsonxClient, config) {
  this.watsonxClient = watsonxClient;
  this.config = config;
  // Default: 999 (effectively unlimited)
  this.maxQuestions = config.prompts.maxQuestions || 999;
}
```

### Customize Priority Prompts

In `src/ai/prompts/question-generation.js`:

```javascript
const QUESTION_GENERATION_PROMPT = `...
Priority 1 (HIGH/CRITICAL) - Ask these FIRST:
- Your custom priority 1 criteria
...`;
```

### Modify Follow-Up Logic

In `src/generator/question-generator.js`:

```javascript
async generateFollowUpRound(context, previousAnswers, roundNumber) {
  // Customize follow-up generation logic
  // Adjust vague answer detection
  // Modify question prioritization
}
```

## Example Session

```bash
$ specbaker generate

🎯 What software do you want to build?
> A task management app for remote teams

📊 Analyzing your goal...
✅ Analysis complete

📋 Initial Questions (Priority 1 - Critical)

❓ Who are the primary users?
→ Remote team members, project managers

❓ What are the top 3 core features?
→ Task creation, Team collaboration, Progress tracking

❓ What is the main problem being solved?
→ Difficulty coordinating tasks across time zones

💡 You can stop the questioning at any time.

🔄 Would you like to answer follow-up questions for more clarity? (Y/n)
> y

📋 Follow-Up Questions (Round 2)

❓ How many team members typically use the app?
→ 5-50 members per team

❓ What collaboration features are most important?
→ Real-time updates, Comments, File sharing

🔄 Would you like to continue with more follow-up questions? (Y/n)
> y

📋 Follow-Up Questions (Round 3)

❓ What file types need to be supported for sharing?
→ Documents, images, PDFs

❓ Are there any specific time zone handling requirements?
→ Show deadlines in user's local time

🔄 Would you like to continue with more follow-up questions? (Y/n)
> n

✅ Proceeding to specification generation...
```

## Technical Details

### Question Object Structure

```javascript
{
  id: "q1",
  category: "Core Functionality",
  text: "What are the top 3 most important features?",
  priority: 1,              // 1=high, 2=medium, 3=low
  allowMultiple: true,      // Auto-detected or AI-specified
  suggestedAnswers: []      // Optional suggestions
}
```

### Priority Sorting

Questions are sorted before presentation:

```javascript
followUpQuestions.sort((a, b) => (a.priority || 2) - (b.priority || 2));
```

This ensures priority 1 questions are always asked before priority 2, and priority 2 before priority 3.

### Vague Answer Detection

The AI analyzes answers for:
- Short responses (< 10 words)
- Generic terms ("something", "maybe", "not sure")
- Incomplete information
- Contradictions with previous answers

## Troubleshooting

### Too Many Questions

If you're getting too many follow-up rounds:

1. Provide more detailed initial answers
2. Reduce `maxQuestions` in config
3. Adjust follow-up sensitivity in question generator

### Not Enough Questions

If you need more depth:

1. Answer initial questions briefly to trigger follow-ups
2. Manually request more rounds
3. Adjust priority thresholds in prompts

### Wrong Priority Assignment

If questions are in wrong order:

1. Review priority guidelines in `question-generation.js`
2. Adjust AI prompt examples
3. Test with different goal types

## See Also

- [Prompt Customization Guide](./PROMPT_CUSTOMIZATION.md)
- [Multiple Choice Questions](./MULTIPLE_CHOICE_QUESTIONS.md)
- [Technical Specification](../TECHNICAL_SPEC.md)