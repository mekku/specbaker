# Multiple Choice Questions Feature

## Overview

SpecBaker now supports both single-choice and multiple-choice questions, allowing users to select multiple options when appropriate.

## How It Works

### Question Types

1. **Single Choice (Radio Button)** - User selects one option
   - Uses `list` prompt type in Inquirer.js
   - Example: "What is the target timeline?"

2. **Multiple Choice (Checkbox)** - User can select multiple options
   - Uses `checkbox` prompt type in Inquirer.js
   - Example: "Who are the primary users?" (can select multiple user types)

### Question Configuration

Questions are configured with an `allowMultiple` property:

```javascript
{
  id: 'q1',
  category: 'User & Audience',
  text: 'Who are the primary users of this application?',
  priority: 1,
  allowMultiple: true,  // Enables multiple selection
  suggestedAnswers: ['General public', 'Business users', 'Internal team']
}
```

### User Experience

#### Single Choice Questions
```
[1/10] What is the target timeline for the first version?
Category: Priority
? Your answer: (Use arrow keys)
❯ < 1 month
  1-3 months
  3-6 months
  > 6 months
  ────────────
  Other (type custom answer)
```

#### Multiple Choice Questions
```
[2/10] Who are the primary users of this application?
Category: User & Audience
  (You can select multiple options using Space, then press Enter)
? Your answer: (Press <space> to select, <a> to toggle all, <i> to invert selection)
❯◯ General public
 ◯ Business users
 ◉ Internal team
 ◯ Specific professionals
 ────────────
 ◯ Other (type custom answer)
```

### Answer Format

- **Single choice**: Returns a single string
  - Example: `"1-3 months"`

- **Multiple choice**: Returns comma-separated values
  - Example: `"General public, Internal team"`

### Custom Answers

Both question types support custom answers:

1. **Single choice**: Select "Other" → Enter custom text
2. **Multiple choice**: Select "Other" → Enter comma-separated values
   - Input: `"Developers, Testers"`
   - Combined with selections: `"General public, Internal team, Developers, Testers"`

## Questions with Multiple Selection Enabled

By default, these question categories support multiple selection:

1. **User & Audience**
   - "Who are the primary users?" ✓ Multiple

2. **Access & Deployment**
   - "How will users access this application?" ✓ Multiple

3. **Core Functionality**
   - "Are there any existing systems to integrate with?" ✓ Multiple

4. **Success Criteria**
   - "How will you measure success?" ✓ Multiple

5. **Constraints**
   - "Are there any specific technical constraints?" ✓ Multiple

## Implementation Details

### Interactive Prompter

The `InteractivePrompter` class automatically detects the `allowMultiple` flag and:

1. Shows appropriate hint text for multiple selection
2. Uses `checkbox` type instead of `list`
3. Validates that at least one option is selected
4. Handles "Other" option for custom inputs
5. Joins multiple selections with commas

### Question Generator

The `QuestionGenerator` class marks appropriate questions with `allowMultiple: true` based on:

- Question category
- Question text analysis
- Expected answer type

### Context Builder

The `ContextBuilder` stores answers as strings, whether single or multiple selections. Multiple selections are stored as comma-separated values.

## Benefits

1. **More Accurate Requirements** - Users can specify multiple platforms, user types, etc.
2. **Better User Experience** - Natural selection for questions that have multiple valid answers
3. **Flexible Input** - Supports both predefined and custom answers
4. **Clear Indication** - Visual hints show when multiple selection is available

## Example Usage

```bash
$ specbaker generate "Build a mobile app"

[1/5] Who are the primary users of this application?
Category: User & Audience
  (You can select multiple options using Space, then press Enter)
? Your answer: 
❯◉ General public
 ◉ Business users
 ◯ Internal team
 ◯ Specific professionals

# User selects "General public" and "Business users"
# Answer stored as: "General public, Business users"
```

## Future Enhancements

- [ ] AI-powered detection of which questions should allow multiple selection
- [ ] Configurable separator (comma, semicolon, etc.)
- [ ] Maximum selection limit for certain questions
- [ ] Grouped checkboxes for related options
- [ ] Search/filter for long option lists