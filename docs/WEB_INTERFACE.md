# SpecBaker Web Interface

The SpecBaker web interface provides a user-friendly way to generate specifications without using the command line.

## Features

✨ **Interactive UI** - Clean, modern interface for specification generation
📊 **Real-time Progress** - Visual indicators showing generation progress
📝 **Rich Markdown Rendering** - Beautiful rendering of generated specifications
💾 **Download Support** - Download specifications as .md files
🎨 **Responsive Design** - Works on desktop, tablet, and mobile devices

## Getting Started

### 1. Start the Web Server

Using npm script:
```bash
npm run web
```

Or using the CLI:
```bash
specbaker web
```

Custom port:
```bash
specbaker web --port 8080
```

### 2. Open Your Browser

Navigate to:
```
http://localhost:3000
```

### 3. Generate Your Specification

1. **Describe Your Goal** - Enter what you want to build
2. **Answer Questions** - Provide details through interactive questions
3. **Watch Progress** - See real-time generation progress
4. **Review & Download** - View the rich rendered specification and download as .md

## How It Works

### Step 1: Goal Input
Enter a description of your software project. Be as detailed or as brief as you like - the AI will ask clarifying questions.

**Example:**
```
I want to build a task management app for small teams that helps them 
track projects, assign tasks, and collaborate in real-time.
```

### Step 2: Clarifying Questions
Answer 5-10 targeted questions about:
- Target users and audience
- Core functionality
- Access and deployment
- Success criteria
- Technical constraints

**Features:**
- Suggested answers for quick selection
- Multiple choice support
- Free-form text input
- Previous/Next navigation

### Step 3: Generation Process
Watch as SpecBaker generates your specification with real-time progress updates:

1. ✓ Analyzing requirements
2. ✓ Creating product summary
3. ✓ Defining user roles
4. ✓ Documenting core requirements
5. ✓ Mapping user journey
6. ✓ Designing data model
7. ✓ Outlining UI screens
8. ✓ Creating test scenarios
9. ✓ Building implementation plan
10. ✓ Finalizing specification

### Step 4: Results
View your complete specification with:
- **Statistics** - Sections, word count, reading time, file size
- **Rich Rendering** - Beautiful markdown formatting with syntax highlighting
- **Download Button** - Save as .md file
- **New Specification** - Start over with a new project

## API Endpoints

The web interface uses these REST API endpoints:

### `POST /api/analyze`
Analyze a goal and generate clarifying questions.

**Request:**
```json
{
  "goal": "Build a task management app"
}
```

**Response:**
```json
{
  "analysis": { ... },
  "questions": [
    {
      "id": "q1",
      "category": "User & Audience",
      "text": "Who are the primary users?",
      "suggestedAnswers": ["Teams", "Individuals", "Enterprise"]
    }
  ]
}
```

### `POST /api/generate`
Generate specification from goal and answers (Server-Sent Events).

**Request:**
```json
{
  "goal": "Build a task management app",
  "answers": {
    "q1": "Small teams of 5-10 people",
    "q2": "Web browser and mobile app"
  }
}
```

**Response (SSE Stream):**
```
data: {"type":"progress","message":"Analyzing...","progress":10}
data: {"type":"progress","message":"Generating...","progress":50}
data: {"type":"complete","specification":{...},"markdown":"..."}
```

## Development

### Run in Development Mode
With auto-reload on file changes:
```bash
npm run web:dev
```

### File Structure
```
public/
├── index.html      # Main HTML page
├── styles.css      # Styling
└── app.js          # Frontend JavaScript

src/web/
└── server.js       # Express server

src/cli/commands/
└── web.js          # CLI command
```

### Customization

#### Change Port
```bash
PORT=8080 npm run web
```

#### Modify Styling
Edit `public/styles.css` to customize colors, fonts, and layout.

#### Add Features
The frontend app is in `public/app.js` - extend the `SpecBakerApp` class.

## Troubleshooting

### Server Won't Start
- Check if port 3000 is already in use
- Ensure dependencies are installed: `npm install`
- Verify configuration: `specbaker config list`

### API Errors
- Check watsonx.ai credentials: `specbaker config setup`
- Verify network connectivity
- Check server logs for detailed error messages

### Blank Page
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure all static files are being served

## Production Deployment

### Environment Variables
```bash
PORT=3000
NODE_ENV=production
```

### Using PM2
```bash
pm2 start src/web/server.js --name specbaker-web
```

### Using Docker
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "web"]
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name specbaker.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Security Considerations

- **API Keys** - Never expose watsonx.ai API keys in frontend code
- **Rate Limiting** - Consider adding rate limiting for production
- **CORS** - Configure appropriate CORS policies
- **HTTPS** - Use HTTPS in production
- **Input Validation** - Server validates all user inputs

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Lazy Loading** - Markdown rendering only when needed
- **Streaming** - Server-Sent Events for real-time updates
- **Caching** - Static assets cached by browser
- **Compression** - Enable gzip in production

## Contributing

To add features to the web interface:

1. Frontend changes → `public/` directory
2. Backend changes → `src/web/server.js`
3. Test locally with `npm run web:dev`
4. Submit pull request

## License

MIT License - Same as SpecBaker CLI

---

**Need Help?** Open an issue on GitHub or check the main README.