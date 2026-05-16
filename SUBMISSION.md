# Hackathon Submission — SpecBaker

## Project Title

**SpecBaker**

## One-line Pitch

**SpecBaker turns vague software goals into structured, Bob-ready implementation specifications.**

## Short Description

SpecBaker is a goal-based specification engine that helps founders, product owners, and developers turn unclear software ideas into structured, implementation-ready specs. It uses IBM watsonx.ai to analyze goals, ask clarification questions, capture decisions, and generate specs that IBM Bob or development teams can use to build with less ambiguity and less back-and-forth.

## Long Description

AI coding tools can build software faster than ever, but they still depend on clear input. When a user starts with a vague idea, the AI or development team often has to guess what should be built, repeatedly ask clarification questions, or implement the wrong scope.

SpecBaker solves this upstream problem.

Instead of starting from a feature list, SpecBaker starts from the user's goal. It analyzes the goal, identifies missing details, asks high-leverage clarification questions, captures key decisions, and generates a structured software specification.

The generated output includes product context, user roles, functional requirements, workflow, data model outline, UI screen outline, test scenarios, implementation plan, and a Bob-ready handoff prompt.

The core workflow is:

```txt
Vague software goal
→ Goal analysis
→ Clarification questions
→ Captured decisions
→ Structured specification
→ IBM Bob / developer handoff
```

SpecBaker is not just a PRD generator. It acts more like a lightweight spec compiler: it converts unclear intent into structured implementation context that an AI coding assistant or development team can act on.

## Problem

AI-assisted development is powerful, but vague requirements remain a major bottleneck.

A user might say:

```txt
I want an approval system for branch purchases.
```

That sounds simple, but it leaves many critical questions unanswered:

```txt
Who can create requests?
Who approves them?
Are there approval thresholds?
What fields are required?
What statuses exist?
What should be logged for audit?
What is out of scope for the MVP?
```

Without this context, AI coding tools may generate the wrong architecture, invent requirements, or build beyond the intended scope.

SpecBaker reduces this ambiguity before implementation begins.

## Solution

SpecBaker provides a guided specification workflow:

1. The user enters a high-level software goal.
2. SpecBaker analyzes the goal and extracts the likely domain, actors, known requirements, assumptions, and unknowns.
3. SpecBaker asks clarification questions that matter for implementation.
4. User answers are captured as explicit decisions.
5. SpecBaker generates a structured implementation-ready specification.
6. The final output includes a Bob-ready handoff prompt that can be copied into IBM Bob.

This allows IBM Bob or a development team to start from better context instead of vague instructions.

## Key Features

- Goal-based software idea intake
- AI-generated goal analysis
- Clarification question generation
- Decision capture
- Structured specification generation
- Markdown spec export
- Bob-ready implementation prompt
- CLI workflow
- Web interface
- Example generated specifications
- IBM Bob development session logs

## IBM Bob Usage

IBM Bob was used as the primary development partner during the project.

Bob helped with:

- Product concept refinement
- Feature planning
- Project structure design
- CLI workflow implementation
- Web interface implementation
- TypeScript/JavaScript code generation and refactoring
- Documentation improvements
- Example specification generation
- Hackathon submission preparation

Evidence of IBM Bob usage is included in the repository under:

```txt
bob_sessions/
```

The Bob session logs show how Bob was used throughout the project development process, not merely mentioned after the fact.

## IBM watsonx.ai Usage

SpecBaker uses IBM watsonx.ai as the runtime AI layer for specification generation.

watsonx.ai is used for:

- Analyzing the user's raw goal
- Identifying missing product details
- Generating clarification questions
- Extracting and organizing decisions
- Producing structured software specifications
- Creating Bob-ready implementation prompts

In the product workflow:

```txt
watsonx.ai helps structure the goal.
SpecBaker turns it into an implementation-ready spec.
IBM Bob uses that spec to build faster and with less ambiguity.
```

## How It Works

SpecBaker takes a user's vague product goal and turns it into a structured specification.

Example input:

```txt
I want to reduce the time my team spends handling purchase approvals across branches.
```

SpecBaker then produces:

- Product summary
- Target users
- Clarifying questions
- Captured decisions
- Functional requirements
- Workflow outline
- Data model outline
- UI screen outline
- Test scenarios
- Implementation plan
- Bob-ready prompt

The final output is designed to be useful both for humans and AI coding tools.

## Demo Flow

The demo shows the full journey from unclear idea to Bob-ready specification.

1. Start with a vague software goal.
2. Run SpecBaker to analyze the goal.
3. Review generated clarification questions.
4. Answer the key questions.
5. Generate a structured specification.
6. Review the generated implementation sections.
7. Copy the Bob-ready prompt.
8. Show the IBM Bob session logs included in the repository.

Recommended demo scenario:

```txt
Branch Purchase Approval System
```

This scenario demonstrates roles, workflow, permissions, approval thresholds, audit history, and implementation handoff.

## Technology Stack

- Node.js
- JavaScript / TypeScript-ready architecture
- Express.js web server
- CLI interface
- IBM watsonx.ai
- IBM Bob
- Markdown-based output
- Local examples and generated artifacts

## Repository Structure

```txt
specbaker/
  bob_sessions/
    IBM Bob development session logs

  examples/
    Generated specification examples

  docs/
    Product and demo documentation

  src/ or lib/
    Core application logic

  public/ or web/
    Web interface assets, if applicable

  README.md
    Main project documentation

  SUBMISSION.md
    Hackathon submission summary
```

## How to Run

Install dependencies:

```bash
npm install
```

Configure environment variables:

```bash
cp .env.example .env
```

Start the web interface:

```bash
npm run web
```

Or run the CLI workflow:

```bash
npm run generate
```

Please see `README.md` for the latest run instructions.

## Example Output

SpecBaker generates a structured specification that includes:

```txt
1. Product Summary
2. User Roles
3. Core Requirements
4. Important Decisions
5. Workflow / User Journey
6. Data Model Outline
7. UI Screen Outline
8. Test Scenarios
9. Implementation Plan
10. Bob-ready Prompt
```

Example generated specs are available in:

```txt
examples/
```

## Business Value

SpecBaker improves the early stage of software development by reducing ambiguity before implementation begins.

It helps:

- Founders explain ideas more clearly
- Product owners create better development handoffs
- Developers reduce repeated clarification loops
- AI coding tools receive better structured context
- Teams move from idea to implementation faster

The main value is not just faster document generation. The real value is fewer wrong builds, fewer repeated questions, and better handoff into AI-assisted development.

## Why This Fits the IBM Bob Hackathon

IBM Bob can help developers build faster, but Bob still needs clear implementation context.

SpecBaker improves the quality of that context.

The project demonstrates a practical workflow:

```txt
User goal
→ SpecBaker clarification and structuring
→ Bob-ready implementation prompt
→ IBM Bob-assisted development
```

This directly supports the hackathon theme of turning ideas into impact faster.

## Current Status

SpecBaker is a hackathon proof of concept.

Implemented:

- Goal-based specification workflow
- watsonx.ai-powered generation flow
- CLI support
- Web interface support
- Example generated specification
- Bob session logs
- Documentation for demo and submission

Planned future improvements:

- More interactive editing of generated spec sections
- GitHub issue export
- Jira / Linear export
- OpenAPI generation
- Multi-project workspace
- Team collaboration
- Versioned decision history
- Direct IBM Bob handoff workflow

## Demo Assets

Recommended submission assets:

```txt
Video presentation
Slide presentation
Screenshots
Example generated spec
IBM Bob session logs
Public GitHub repository
```

## Links

- GitHub Repository: https://github.com/mekku/specbaker
- Demo Video: TBD
- Slide Presentation: TBD
- Live Demo: TBD

## Final Summary

SpecBaker helps solve one of the biggest bottlenecks in AI-assisted development: unclear input.

By turning vague software goals into structured, decision-backed, Bob-ready implementation specs, SpecBaker helps IBM Bob and development teams build with better context, less ambiguity, and fewer repeated clarification loops.
