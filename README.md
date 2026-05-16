# SpecBaker 🎂

> Transform vague software ideas into structured, implementation-ready specifications using IBM watsonx.ai

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Powered by watsonx.ai](https://img.shields.io/badge/Powered%20by-watsonx.ai-blue)](https://www.ibm.com/watsonx)

## 🌟 Overview

**SpecBaker** is a CLI first and WebUI (Provided) tool that helps you turn vague software goals into comprehensive, structured specifications. It uses IBM watsonx.ai to intelligently analyze your ideas, ask clarifying questions, and generate complete technical specifications that are ready for implementation with IBM Bob or any development team.

### The Problem

- 💭 You have a great software idea but struggle to articulate requirements
- 📝 Writing detailed specifications is time-consuming and error-prone
- 🤔 You're not sure what questions to ask or what details to include
- 🔄 Requirements are often ambiguous, leading to rework

### The Solution

SpecBaker solves this by:

1. **Analyzing** your initial goal using AI
2. **Asking** intelligent clarifying questions
3. **Generating** a comprehensive 11-section specification
4. **Formatting** everything as clean, version-control-friendly markdown
5. **Providing** a Bob-ready prompt for immediate implementation

## ✨ Features

- 🤖 **AI-Powered Analysis** - Uses IBM watsonx.ai to understand your goals
- 💬 **Interactive Q&A** - Asks smart questions based on your answers
- 📋 **Comprehensive Output** - Generates 11 structured specification sections
- 🎯 **Bob-Ready** - Includes a complete prompt optimized for IBM Bob
- ⚡ **Fast** - Complete specification in under 5 minutes
- 🎨 **Clean Markdown** - Version control friendly output
- 🔧 **Configurable** - Customize questions, models, and output
- 🌐 **Web Interface** - User-friendly browser-based UI (no CLI needed!)

## 📦 Installation

### Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- IBM watsonx.ai account with API key

### Global Installation

```bash
npm install -g specbaker
```

### Local Installation

```bash
npm install specbaker
```

### From Source

```bash
git clone https://github.com/yourusername/specbaker.git
cd specbaker
npm install
npm link
```

## 🚀 Quick Start

### 1. Configure SpecBaker

Run the interactive setup wizard:

```bash
specbaker config setup
```

Or set credentials manually:

```bash
specbaker config set watsonx.apiKey YOUR_API_KEY
specbaker config set watsonx.projectId YOUR_PROJECT_ID
```

### 2. Generate Your First Specification

```bash
specbaker generate "Build a todo app with user authentication"
```

That's it! SpecBaker will:
- Analyze your goal
- Ask clarifying questions
- Generate a complete specification
- Save it to `specification.md`

### 2b. Or Use the Web Interface

Prefer a graphical interface? Start the web server:

```bash
specbaker web
```

Then open your browser to `http://localhost:3000` and generate specifications through a beautiful, interactive UI!

See [Web Interface Documentation](docs/WEB_INTERFACE.md) for more details.

## 📖 Usage

### Basic Usage

```bash
# Generate with interactive questions
specbaker generate "Your software goal here"

# Specify output file
specbaker generate "Build an e-commerce platform" -o my-spec.md

# Skip interactive mode (use defaults)
specbaker generate "Build an API service" --no-interactive

# Enable verbose output
specbaker generate "Build a mobile app" --verbose
```

### Configuration Commands

```bash
# Interactive setup
specbaker config setup

# Set a value
specbaker config set watsonx.region us-south

# Get a value
specbaker config get watsonx.model

# List all configuration
specbaker config list
```

### Validation

```bash
# Validate a specification
specbaker validate specification.md

# Strict validation
specbaker validate specification.md --strict
```

### Help

```bash
# General help
specbaker --help

# Command-specific help
specbaker generate --help
specbaker config --help
```

## 📋 Generated Specification Sections

SpecBaker generates a comprehensive specification with 11 sections:

1. **Product Summary** - Goal, problem, success criteria
2. **User Roles** - User types, personas, permissions
3. **Access & Deployment** - How users access, deployment model
4. **Core Requirements** - Functional and non-functional requirements
5. **Important Decisions** - Architecture, technology choices, trade-offs
6. **User Journey / Workflow** - Step-by-step user flows
7. **Data Model** - Entities, relationships, constraints
8. **UI Screen Outline** - Screen list, components, navigation
9. **Test Scenarios** - Critical test cases, acceptance criteria
10. **Implementation Plan** - Phased development approach
11. **Bob-Ready Prompt** - Complete prompt for IBM Bob

## 🎯 Example

### Input

```bash
specbaker generate "I want an app for my coffee shop where customers can order ahead and earn rewards"
```

### Interactive Questions

SpecBaker will ask questions like:
- Who are the primary users?
- How will users access this application?
- What are the top 3 most important features?
- What is the expected number of users?
- What is the preferred deployment model?

### Output

A complete `specification.md` file with all 11 sections, ready for:
- Review with stakeholders
- Implementation with IBM Bob
- Handoff to development team
- Version control and tracking

See [examples/coffee-shop-example.md](examples/coffee-shop-example.md) for a complete example.

## ⚙️ Configuration

SpecBaker can be configured via:

1. **Command-line flags** (highest priority)
2. **Environment variables**
3. **Config file** (`~/.specbaker/config.json`)
4. **Default values** (lowest priority)

### Environment Variables

Create a `.env` file or set environment variables:

```bash
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id
WATSONX_REGION=us-south
WATSONX_MODEL=openai/gpt-oss-120b
MAX_QUESTIONS=10
QUESTION_DEPTH=detailed
```

### Configuration File

Located at `~/.specbaker/config.json`:

```json
{
  "watsonx": {
    "apiKey": "your_api_key",
    "projectId": "your_project_id",
    "region": "us-south",
    "model": "openai/gpt-oss-120b",
    "maxTokens": 4000,
    "temperature": 0.4
  },
  "output": {
    "defaultPath": "specification.md",
    "includeTimestamp": true
  },
  "prompts": {
    "maxQuestions": 10,
    "questionDepth": "detailed"
  }
}
```

## 🔧 Advanced Usage

### Custom Output Path

```bash
specbaker generate "Build a CRM system" -o specs/crm-spec.md
```

### Non-Interactive Mode

```bash
specbaker generate "Build a blog platform" --no-interactive
```

### Debug Mode

```bash
specbaker generate "Build a chat app" --debug
```

### Using Custom Config File

```bash
specbaker generate "Build an API" -c ./custom-config.json
```

## 🤝 Integration with IBM Bob

The generated specification includes a "Bob-Ready Prompt" section that you can copy and paste directly into IBM Bob:

1. Generate your specification with SpecBaker
2. Open the generated `specification.md` file
3. Find the "Bob-Ready Prompt" section
4. Copy the entire prompt
5. Paste it into IBM Bob
6. Bob will implement your specification!

## 🏗️ Architecture

```
User Input (Vague Goal)
    ↓
Goal Analyzer (watsonx.ai)
    ↓
Question Generator (watsonx.ai)
    ↓
Interactive Prompter (CLI)
    ↓
Context Builder (Accumulate Answers)
    ↓
Spec Engine (watsonx.ai)
    ↓
Markdown Formatter
    ↓
Specification Output (Bob-Ready)
```

## 📚 Documentation

- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Detailed implementation guide
- [Technical Specification](TECHNICAL_SPEC.md) - Technical architecture
- [Demo Scenario](DEMO_SCENARIO.md) - Demo walkthrough
- [Project Summary](PROJECT_SUMMARY.md) - Project overview

## 🧪 Development

### Setup Development Environment

```bash
git clone https://github.com/yourusername/specbaker.git
cd specbaker
npm install
```

### Run Tests

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

### Format Code

```bash
npm run format
```

## 🐛 Troubleshooting

### "Configuration validation failed"

Make sure you've set up your watsonx.ai credentials:

```bash
specbaker config setup
```

### "Authentication failed"

Check that your API key and project ID are correct:

```bash
specbaker config get watsonx.apiKey
specbaker config get watsonx.projectId
```

### "API rate limit exceeded"

Wait a moment and try again. SpecBaker includes automatic retry logic.

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [IBM watsonx.ai](https://www.ibm.com/watsonx)
- Designed for [IBM Bob](https://www.ibm.com/products/watsonx-code-assistant)
- Powered by [Commander.js](https://github.com/tj/commander.js), [Inquirer.js](https://github.com/SBoudrias/Inquirer.js), and other amazing open-source tools

## 📞 Support

- 📧 Email: support@specbaker.dev
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/specbaker/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/specbaker/discussions)

## 🗺️ Roadmap

- [ ] Support for multiple output formats (PDF, HTML)
- [ ] Template system for different project types
- [ ] Integration with project management tools
- [ ] Multi-language support
- [ ] Plugin system for extensibility
- [ ] Web interface
- [ ] Team collaboration features

---

**Made with ❤️ for the IBM watsonx.ai Hackathon**

*SpecBaker - Because every great project starts with a great specification!* 🎂
