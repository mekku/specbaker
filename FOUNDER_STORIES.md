# SpecBaker - Founder Stories & Decision Log

This document tracks all major decisions, improvements, and the reasoning behind them during the development of SpecBaker.

## Project Genesis

**Date:** May 2026  
**Vision:** Create a CLI tool that transforms vague software goals into structured, implementation-ready specifications using IBM watsonx.ai.

**Core Philosophy:**
- Make specification writing accessible to non-technical founders
- Use AI to guide users through comprehensive requirements gathering
- Generate professional, developer-ready documentation
- Work like a Systems Analyst (SA) - deep, thorough, and iterative

---

## Major Decisions & Improvements

### 1. Unlimited Deep-Dive Questioning (May 16, 2026)

**Problem Identified:**
- Initial implementation limited questioning to 2-3 rounds
- Users felt rushed and couldn't fully explore their requirements
- Didn't match how real Systems Analysts work

**Decision:**
Implement unlimited questioning rounds with priority-based ordering, allowing users to stop when they feel complete.

**Rationale:**
- Real SA work involves deep diving until all concerns are addressed
- Users know their domain best and should control when to stop
- Quality specifications require thorough exploration, not arbitrary limits

**Implementation:**
- Changed from fixed for-loop to unlimited while-loop
- Added priority sorting (1=high, 2=medium, 3=low)
- Added "you can stop anytime" messaging throughout
- Questions sorted by priority before each round

**Files Modified:**
- `src/cli/commands/generate.js` - Main generation flow
- `src/generator/question-generator.js` - Removed question limits
- `src/ai/prompts/question-generation.js` - Enhanced priority guidelines

**Impact:**
- Users can now explore requirements as deeply as needed
- Higher quality specifications from thorough questioning
- More natural, conversational flow
- Better matches professional SA methodology

---

### 2. Multiple-Choice Auto-Detection (May 16, 2026)

**Problem Identified:**
- Questions like "What are the top 3 features?" required single selection
- AI wasn't automatically determining when multiple selections were appropriate
- Users had to manually work around this limitation

**Decision:**
Implement automatic detection of multiple-choice questions based on question text analysis.

**Rationale:**
- Natural language contains clear signals for multiple selection needs
- Keywords like "top 3", "which", "features" indicate multiple answers expected
- Improves user experience by matching question intent

**Implementation:**
- Added `detectAllowMultiple()` method in question-generator.js
- Analyzes question text for keywords and phrases
- Automatically sets `allowMultiple: true` when detected

**Detection Keywords:**
- Numeric: "top 3", "top 5", "top N"
- Interrogative: "which", "what are"
- Plural nouns: "features", "platforms", "integrations"
- Explicit: "select all", "choose multiple"
- Listing: "list the", "name the"

**Files Modified:**
- `src/generator/question-generator.js` - Added detection method
- `docs/MULTIPLE_CHOICE_QUESTIONS.md` - Documentation

**Impact:**
- More intuitive question answering
- Matches user expectations
- Reduces friction in the questioning process

---

### 3. Modular AI Prompts (May 16, 2026)

**Problem Identified:**
- AI prompts were hardcoded in various files
- Difficult to fine-tune and customize
- No easy way for users to adjust AI behavior

**Decision:**
Separate all AI prompts into dedicated files for easy customization.

**Rationale:**
- Prompts are the "brain" of the system and need frequent tuning
- Different domains may need different prompting strategies
- Users should be able to customize without touching core logic

**Implementation:**
Created three prompt files:
1. `src/ai/prompts/goal-analysis.js` - Goal analysis prompts
2. `src/ai/prompts/question-generation.js` - Question generation prompts
3. `src/ai/prompts/spec-generation.js` - All 11 specification section prompts

**Files Created:**
- `src/ai/prompts/goal-analysis.js`
- `src/ai/prompts/question-generation.js`
- `src/ai/prompts/spec-generation.js`
- `docs/PROMPT_CUSTOMIZATION.md`

**Impact:**
- Easy prompt fine-tuning without code changes
- Clear separation of concerns
- Better maintainability
- Enables domain-specific customization

---

### 4. Priority-Based Question Ordering (May 16, 2026)

**Problem Identified:**
- Questions were asked in random or generation order
- Critical questions sometimes came after less important ones
- Inefficient use of user's time and attention

**Decision:**
Implement strict priority-based ordering with clear guidelines for AI.

**Priority Levels:**
- **Priority 1 (HIGH/CRITICAL)**: Core functionality, main users, primary goals
- **Priority 2 (MEDIUM/IMPORTANT)**: Specific features, integrations, constraints
- **Priority 3 (LOW/NICE-TO-HAVE)**: Optional features, future enhancements, edge cases

**Rationale:**
- Most important questions should be answered first
- Ensures minimum viable specification even if user stops early
- Matches how professional SAs prioritize information gathering

**Implementation:**
- Enhanced AI prompt with detailed priority guidelines and examples
- Added sorting before question presentation: `sort((a, b) => (a.priority || 2) - (b.priority || 2))`
- Default priority 2 for questions without explicit priority

**Files Modified:**
- `src/ai/prompts/question-generation.js` - Detailed priority guidelines
- `src/cli/commands/generate.js` - Priority sorting logic

**Impact:**
- More efficient questioning process
- Critical information gathered first
- Better user experience
- Higher quality specifications even with early stops

---

### 5. Optional Developer/Technical Questions (May 16, 2026)

**Problem Identified:**
- Some users wanted to specify technical details upfront
- Others preferred to focus on business requirements only
- No way to optionally include technical considerations

**Decision:**
Add 15 optional developer/technical questions that users can choose to answer.

**Question Categories:**
1. Architecture & Design (3 questions)
2. Technology Stack (3 questions)
3. DevOps & Deployment (3 questions)
4. Testing & Quality (3 questions)
5. Documentation & Maintenance (3 questions)

**Rationale:**
- Technical founders want to specify tech stack early
- Non-technical founders can skip and let developers decide
- Provides flexibility for different user types

**Implementation:**
- Created `src/generator/developer-questions.js` with 15 questions
- Added optional prompt in generate command
- Questions integrated into context if answered

**Files Created:**
- `src/generator/developer-questions.js`

**Impact:**
- Flexibility for technical vs non-technical users
- Better specifications when technical details are known
- Doesn't overwhelm non-technical users

---

### 6. Spec Generation Bug Fix (May 16, 2026)

**Problem Identified:**
- All specification sections failing to generate
- Showing "generation failed, using template" warnings
- Method call mismatch after prompt refactoring

**Root Cause:**
- `spec-engine.js` was calling removed `getSectionPrompt()` method
- Should directly use watsonx-client with prompt files

**Decision:**
Fix method call to use watsonx-client correctly with new prompt structure.

**Implementation:**
```javascript
// Before (broken):
const prompt = this.getSectionPrompt(sectionName, contextData);

// After (fixed):
const content = await this.watsonxClient.generateSection(sectionName, contextData);
```

**Files Modified:**
- `src/generator/spec-engine.js`

**Impact:**
- All 11 specification sections now generate correctly
- Proper use of modular prompt files
- Reliable specification generation

---

## Technical Architecture Decisions

### CLI Framework: Commander.js
**Reason:** Industry standard, excellent documentation, extensible

### Interactive Prompts: Inquirer.js
**Reason:** Rich prompt types, checkbox/list support, great UX

### AI Integration: IBM watsonx.ai SDK
**Reason:** Project requirement, powerful LLM capabilities, enterprise-grade

### File Format: Markdown
**Reason:** Universal, readable, version-control friendly, developer-familiar

### Configuration: JSON
**Reason:** Simple, human-readable, easy to edit

---

## Design Principles

1. **User-Centric**: Always prioritize user experience over technical elegance
2. **Flexibility**: Support both technical and non-technical users
3. **Transparency**: Clear messaging about what's happening and why
4. **Quality**: Thorough requirements gathering leads to better specifications
5. **Modularity**: Separate concerns for easy maintenance and customization
6. **Professional**: Generate specifications that developers respect and can use

---

### 7. No Fallback Templates - AI Required (May 16, 2026)

**Problem Identified:**
- When AI question/spec generation fails, fallback templates create misleading specifications
- Example: "Warehouse management app" showing "General public, Business users" as user options
- Template-generated specs are low quality and not useful for developers
- Users might not realize the spec is template-based, not AI-generated

**Root Cause:**
- Fallback templates were meant to be helpful but actually mislead users
- Generic templates cannot capture domain-specific nuances
- Quality of template specs is too low to be useful

**Critical Decision:**
**REMOVE ALL FALLBACK TEMPLATES. Require working AI connection.**

**Rationale:**
- **Quality over availability**: A bad spec is worse than no spec
- **Clear failure**: Users should know immediately if AI isn't working
- **No misleading content**: Templates give false confidence
- **Force proper setup**: Ensures users configure watsonx.ai correctly
- **Maintain reputation**: SpecBaker's value is AI-powered quality

**Implementation:**
Changed from graceful degradation to fail-fast approach:

**Question Generation:**
```javascript
// Before: Fallback to templates
catch (error) {
    logger.warn('AI failed, using template questions');
    questions = this.generateTemplateQuestions(analysis);
}

// After: Fail with clear message
catch (error) {
    logger.error('AI question generation failed');
    logger.error('SpecBaker requires a working AI connection.');
    logger.info('Please ensure your watsonx.ai API key is configured');
    throw new Error('Cannot proceed without AI');
}
```

**Spec Generation:**
```javascript
// Before: Fallback to template content
catch (error) {
    spinner.warn(`${section.name} generation failed, using template`);
    this.generatedSections[section.key] = this.getFallbackContent(section.name);
}

// After: Fail immediately
catch (error) {
    spinner.fail(`${section.name} generation failed`);
    logger.error('SpecBaker requires working AI connection');
    throw new Error(`AI generation failed at section: ${section.name}`);
}
```

**User Experience:**
When AI fails, users now see:
```
❌ AI question generation failed
❌ SpecBaker requires a working AI connection to generate quality specifications.

Please ensure:
1. Your watsonx.ai API key is configured correctly
2. Your project ID is valid
3. You have network connectivity

Run: specbaker config setup
```

**Files Modified:**
- `src/generator/question-generator.js` - Removed template fallback, added clear error
- `src/generator/spec-engine.js` - Removed template fallback, fail immediately

**Impact:**
- ✅ **No misleading specifications** - Users know immediately if something is wrong
- ✅ **Forces proper setup** - Users must configure AI correctly
- ✅ **Maintains quality** - Only AI-generated specs are produced
- ✅ **Clear error messages** - Users know exactly what to fix
- ✅ **Protects reputation** - SpecBaker only produces quality output

**Philosophy:**
> "It's better to fail clearly than to succeed poorly. A bad specification is worse than no specification."

---

## Future Considerations

### Potential Improvements
- [ ] Add more domain-specific templates (manufacturing, real estate, etc.)
- [ ] Add specification templates for common project types
- [ ] Implement specification versioning and comparison
- [ ] Add collaborative features for team specification building
- [ ] Create web interface for non-CLI users
- [ ] Add export to other formats (PDF, DOCX, Confluence)
- [ ] Implement specification validation against best practices
- [ ] Add integration with project management tools
- [ ] Create specification quality scoring

### Lessons Learned
1. **Unlimited questioning is better than arbitrary limits** - Users know when they're done
2. **Priority matters** - Order of questions significantly impacts quality
3. **Auto-detection improves UX** - Smart defaults reduce user friction
4. **Modular prompts are essential** - AI behavior needs frequent tuning
5. **Flexibility wins** - Support different user types and workflows

---

## Metrics & Success Criteria

### Quality Indicators
- Specification completeness (all 11 sections generated)
- User satisfaction with questioning process
- Developer usability of generated specs
- Time saved vs manual specification writing

### Usage Patterns
- Average number of questioning rounds
- Most common question priorities
- Technical vs non-technical user ratio
- Most frequently customized prompts

---

## Contributors & Acknowledgments

**Core Development:** Bob (AI Assistant)  
**Vision & Direction:** Project Founder  
**Technology Partner:** IBM watsonx.ai  

**Special Thanks:**
- Systems Analysts who inspired the deep-dive methodology
- Early testers who identified the questioning limitations
- Open source community for excellent tools (Commander.js, Inquirer.js)

---

## Version History

### v1.0.0 (May 2026)
- Initial release with all core features
- 11 specification sections
- Basic questioning (2-3 rounds)
- watsonx.ai integration

### v1.1.0 (May 16, 2026)
- **MAJOR:** Unlimited deep-dive questioning
- **MAJOR:** Priority-based question ordering
- Multiple-choice auto-detection
- Modular AI prompts
- Optional developer questions
- Spec generation bug fixes
- Comprehensive documentation

---

*This document is continuously updated as the project evolves. All major decisions should be logged here with rationale and impact.*