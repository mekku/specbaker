// SpecBaker Web App - Session-based implementation matching CLI
class SpecBakerApp {
    constructor() {
        this.currentStep = 'goal';
        this.goal = '';
        this.sessionId = null;
        this.analysis = null;
        this.questions = [];
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.followUpRound = 0;
        this.inFollowUpMode = false;
        this.inDeveloperMode = false;
        this.justFinishedFollowUp = false;
        this.specification = '';
        this.rawMarkdown = '';

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // Sections
        this.goalSection = document.getElementById('goal-section');
        this.questionsSection = document.getElementById('questions-section');
        this.processingSection = document.getElementById('processing-section');
        this.resultsSection = document.getElementById('results-section');

        // Goal section
        this.goalInput = document.getElementById('goal-input');
        this.startBtn = document.getElementById('start-btn');

        // Questions section
        this.questionsContainer = document.getElementById('questions-container');
        this.questionCounter = document.getElementById('question-counter');

        // Processing section
        this.processingStatus = document.getElementById('processing-status');
        this.progressFill = document.getElementById('progress-fill');
        this.processingSteps = document.getElementById('processing-steps');

        // Results section
        this.resultsContent = document.getElementById('results-content');
        this.resultsStats = document.getElementById('results-stats');
        this.downloadBtn = document.getElementById('download-btn');
        this.newSpecBtn = document.getElementById('new-spec-btn');
    }

    attachEventListeners() {
        this.startBtn.addEventListener('click', () => this.handleStartGeneration());
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.newSpecBtn.addEventListener('click', () => this.handleNewSpec());
    }

    showSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const sectionMap = {
            'goal': this.goalSection,
            'questions': this.questionsSection,
            'processing': this.processingSection,
            'results': this.resultsSection
        };

        if (sectionMap[sectionName]) {
            sectionMap[sectionName].classList.add('active');
        }
    }

    async handleStartGeneration() {
        this.goal = this.goalInput.value.trim();

        if (!this.goal) {
            alert('Please describe what you want to build');
            return;
        }

        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Analyzing...';

        try {
            // Step 1: Analyze goal and create session
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal: this.goal })
            });

            if (!response.ok) {
                throw new Error('Failed to analyze goal');
            }

            const data = await response.json();
            this.sessionId = data.sessionId; // Store session ID
            this.analysis = data.analysis;
            this.questions = data.questions;

            // Show questions
            this.showSection('questions');
            this.renderCurrentQuestion();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to start generation. Please check your configuration and try again.');
            this.startBtn.disabled = false;
            this.startBtn.textContent = 'Start Generation';
        }
    }

    renderCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            // Determine next step based on current mode
            if (!this.inFollowUpMode) {
                // First time - start follow-up flow
                this.inFollowUpMode = true;
                this.askForFollowUp();
            } else if (this.justFinishedFollowUp && this.followUpRound < 10) {
                // Just finished a round of follow-ups, check if we need more
                this.justFinishedFollowUp = false;
                this.askForFollowUp();
            } else if (!this.inDeveloperMode) {
                // Done with follow-ups, move to developer questions
                this.askForDeveloperQuestions();
            } else {
                // All done, generate spec
                this.startSpecGeneration();
            }
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const phaseText = this.inDeveloperMode ? 'Technical Questions' :
            this.inFollowUpMode ? `Follow-up Round ${this.followUpRound}` :
                'Initial Questions';
        this.questionCounter.textContent = `${phaseText} - Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;

        this.questionsContainer.innerHTML = `
            <div class="question-item">
                <span class="question-category">${question.category || 'General'}</span>
                <div class="question-text">${question.text}</div>
                <textarea 
                    id="answer-input" 
                    class="answer-input" 
                    rows="3" 
                    placeholder="Type your answer here..."
                ></textarea>
                ${question.suggestedAnswers && question.suggestedAnswers.length > 0 ? `
                    <div class="suggested-answers">
                        ${question.suggestedAnswers.map((answer, idx) => `
                            <div class="suggested-answer" data-answer="${answer}">${answer}</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="question-actions">
                ${this.currentQuestionIndex > 0 ? '<button class="btn btn-secondary" id="prev-btn">Previous</button>' : ''}
                <button class="btn btn-primary" id="next-btn">
                    ${this.currentQuestionIndex === this.questions.length - 1 ? 'Continue' : 'Next'}
                </button>
            </div>
        `;

        // Attach event listeners
        const answerInput = document.getElementById('answer-input');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');

        // Pre-fill if answer exists
        if (this.answers[question.id]) {
            answerInput.value = this.answers[question.id];
        }

        // Suggested answers
        document.querySelectorAll('.suggested-answer').forEach(el => {
            el.addEventListener('click', () => {
                const answer = el.dataset.answer;
                if (question.allowMultiple) {
                    el.classList.toggle('selected');
                    const selected = Array.from(document.querySelectorAll('.suggested-answer.selected'))
                        .map(e => e.dataset.answer);
                    answerInput.value = selected.join(', ');
                } else {
                    document.querySelectorAll('.suggested-answer').forEach(e => e.classList.remove('selected'));
                    el.classList.add('selected');
                    answerInput.value = answer;
                }
            });
        });

        nextBtn.addEventListener('click', async () => {
            const answer = answerInput.value.trim();
            if (!answer) {
                alert('Please provide an answer');
                return;
            }
            this.answers[question.id] = answer;
            this.currentQuestionIndex++;

            // Check if this was the last question in the current set
            const isLastQuestion = this.currentQuestionIndex >= this.questions.length;

            if (isLastQuestion) {
                // Add this batch of Q&A to session
                await this.addAnswersToSession(this.questions, this.answers);

                // Mark that we just finished a follow-up round
                if (this.inFollowUpMode && !this.inDeveloperMode) {
                    this.justFinishedFollowUp = true;
                }
            }

            this.renderCurrentQuestion();
        });

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentQuestionIndex--;
                this.renderCurrentQuestion();
            });
        }
    }

    async addAnswersToSession(questions, answers) {
        try {
            console.log('Adding to session:', {
                questionCount: questions.length,
                answerCount: Object.keys(answers).length
            });

            const response = await fetch('/api/add-answers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    questions: questions,
                    answers: answers
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add answers to session');
            }

            console.log('Successfully added answers to session');
        } catch (error) {
            console.error('Error adding answers to session:', error);
            alert('Failed to save answers. Please try again.');
        }
    }

    async askForFollowUp() {
        // Generate follow-up questions using session context
        this.questionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>🔍 Analyzing your answers to identify areas needing clarification...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/followup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    round: ++this.followUpRound
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate follow-up questions');
            }

            const data = await response.json();

            const followUpQuestions = data.questions || [];
            const followUpSummary = data.summary || '';
            const confidenceScore = data.confidenceScore || 0;
            const confidenceReason = data.confidenceReason || '';
            const whatYouKnow = data.whatYouKnow || '';
            const confidenceThreshold = 85;

            console.log('Follow-up data:', { confidenceScore, confidenceReason, questionCount: followUpQuestions.length, whatYouKnow });

            // Hard stop: AI says enough (confidence >= 90 or no questions)
            if (followUpQuestions.length === 0 || confidenceScore >= 90) {
                this.questionsContainer.innerHTML = `
                    <div class="question-item">
                        ${whatYouKnow ? `
                            <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid #0f62fe;">
                                <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f62fe;">📋 What we know so far:</p>
                                <p style="margin: 0; color: #525252; line-height: 1.6;">${whatYouKnow}</p>
                            </div>
                        ` : ''}
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; border-left: 4px solid #24a148; margin-bottom: 20px;">
                            <h3 style="margin: 0 0 12px 0; color: #24a148;">✓ Requirements are sufficient for software specification!</h3>
                        </div>
                        <p>Your answers provide enough information to generate a comprehensive specification.</p>
                    </div>
                    <div class="question-actions">
                        <button class="btn btn-primary" id="continue-btn">Continue to Technical Questions</button>
                    </div>
                `;
                document.getElementById('continue-btn').addEventListener('click', () => {
                    this.askForDeveloperQuestions();
                });
                return;
            }

            // Store the generated questions
            this.pendingFollowUpQuestions = followUpQuestions;

            // Determine confidence level styling
            const getConfidenceColor = (score) => {
                if (score >= 85) return { bg: '#e8f5e9', border: '#a1ada4', text: '#24a148' };
                if (score >= 70) return { bg: '#fff3e0', border: '#f57c00', text: '#f57c00' };
                return { bg: '#ffebee', border: '#d32f2f', text: '#d32f2f' };
            };

            const colors = getConfidenceColor(confidenceScore);
            const isHighConfidence = confidenceScore >= confidenceThreshold;

            // Show confidence-based prompt
            this.questionsContainer.innerHTML = `
                <div class="question-item">
                    ${whatYouKnow ? `
                        <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin-bottom: 16px; border-left: 4px solid #0f62fe;">
                            <p style="margin: 0 0 8px 0; font-weight: 600; color: #0f62fe;">📋 What we know so far:</p>
                            <p style="margin: 0; color: #525252; line-height: 1.6;">${whatYouKnow}</p>
                        </div>
                    ` : ''}
                    <div style="background: ${colors.bg}; padding: 20px; border-radius: 6px; margin-bottom: 20px; border-left: 4px solid ${colors.border};">
                        <p style="margin: 0 0 12px 0;">
                            <strong style="color: ${colors.text};">SpecBaker Confidence: ${confidenceScore}/100</strong>
                            ${isHighConfidence ? ' (Ready to Bake 🎉)' : ''}
                        </p>
                        <p style="margin: 0 0 12px 0;"><strong>Reason:</strong> ${confidenceReason}</p>
                        ${isHighConfidence ? `
                            <p style="margin: 0 0 12px 0; font-weight: 600;">
                                The current details are probably enough for an software spec.
                            </p>
                        ` : ''}
                        <p style="margin: 0 0 12px 0;">${followUpSummary}</p>
                        <p style="margin: 0; font-weight: 600;">
                            There ${followUpQuestions.length === 1 ? 'is' : 'are'} ${followUpQuestions.length} ${isHighConfidence ? 'optional' : 'important'} follow-up question${followUpQuestions.length > 1 ? 's' : ''}.
                        </p>
                    </div>
                    
                    ${isHighConfidence ? `
                        <p style="margin-top: 16px; color: #666; font-style: italic;">
                            💡 You can generate the spec now, or answer optional questions for more detail.
                        </p>
                    ` : `
                        <p style="margin-top: 16px; color: #666; font-style: italic;">
                            💡 Answering these questions will help create a more complete specification.
                        </p>
                    `}
                </div>
                <div class="question-actions">
                    <button class="btn btn-secondary" id="skip-followup-btn">${isHighConfidence ? 'Generate Spec Now' : 'Skip - Continue'}</button>
                    <button class="btn btn-primary" id="continue-followup-btn">Answer Follow-up Questions (${followUpQuestions.length})</button>
                </div>
            `;

            document.getElementById('skip-followup-btn').addEventListener('click', () => {
                // User chose to skip, move to developer questions
                this.followUpRound = 10; // Set high to prevent more rounds
                this.askForDeveloperQuestions();
            });

            document.getElementById('continue-followup-btn').addEventListener('click', () => {
                this.startFollowUpQuestions();
            });

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to analyze for follow-up questions. Continuing to next step...');
            this.askForDeveloperQuestions();
        }
    }

    startFollowUpQuestions() {
        // Use the pre-generated questions
        this.questions = this.pendingFollowUpQuestions;
        this.answers = {}; // Reset answers for this round - important!
        this.currentQuestionIndex = 0;
        this.justFinishedFollowUp = false;

        console.log('Starting follow-up round', this.followUpRound, 'with', this.questions.length, 'questions');

        this.renderCurrentQuestion();
    }

    async askForDeveloperQuestions() {
        this.questionsContainer.innerHTML = `
            <div class="question-item">
                <h3>🔧 Technical/Developer Questions</h3>
                <p>
                    Would you like to answer additional technical questions? These help define 
                    implementation details like technology stack, architecture, and deployment preferences.
                </p>
                <p style="margin-top: 12px; color: #666;">
                    <em>Optional but recommended for more detailed specifications.</em>
                </p>
            </div>
            <div class="question-actions">
            <button class="btn btn-secondary" id="continue-dev-btn">Yes, Ask Technical Questions</button>
                <button class="btn btn-primary" id="skip-dev-btn">Skip - Generate Specification</button>
            </div>
        `;

        document.getElementById('skip-dev-btn').addEventListener('click', () => {
            this.inDeveloperMode = true;
            this.startSpecGeneration();
        });

        document.getElementById('continue-dev-btn').addEventListener('click', async () => {
            await this.generateDeveloperQuestions();
        });
    }

    async generateDeveloperQuestions() {
        this.questionsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>🔧 Generating technical questions...</p>
            </div>
        `;

        try {
            const response = await fetch('/api/developer-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate developer questions');
            }

            const data = await response.json();

            if (!data.questions || data.questions.length === 0) {
                this.inDeveloperMode = true;
                this.startSpecGeneration();
                return;
            }

            // Add developer questions to the queue
            this.inDeveloperMode = true;
            this.questions = data.questions;
            this.answers = {}; // Reset answers for developer questions
            this.currentQuestionIndex = 0;
            this.renderCurrentQuestion();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate developer questions. Proceeding to specification generation...');
            this.inDeveloperMode = true;
            this.startSpecGeneration();
        }
    }

    async startSpecGeneration() {
        this.showSection('processing');

        const steps = [
            { id: 'analyze', text: 'Analyzing requirements', progress: 10 },
            { id: 'summary', text: 'Creating product summary', progress: 20 },
            { id: 'roles', text: 'Defining user roles', progress: 30 },
            { id: 'requirements', text: 'Documenting core requirements', progress: 45 },
            { id: 'workflow', text: 'Mapping user journey', progress: 60 },
            { id: 'data', text: 'Designing data model', progress: 70 },
            { id: 'ui', text: 'Outlining UI screens', progress: 80 },
            { id: 'tests', text: 'Creating test scenarios', progress: 90 },
            { id: 'plan', text: 'Building implementation plan', progress: 95 },
            { id: 'finalize', text: 'Finalizing specification', progress: 100 }
        ];

        this.renderProcessingSteps(steps);

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate specification');
            }

            // Stream the response
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = JSON.parse(line.slice(6));
                        this.handleProgressUpdate(data, steps);
                    }
                }
            }

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to generate specification. Please try again.');
            this.showSection('questions');
        }
    }

    renderProcessingSteps(steps) {
        this.processingSteps.innerHTML = steps.map(step => `
            <div class="processing-step" data-step="${step.id}">
                <span class="step-icon">⏳</span>
                <span>${step.text}</span>
            </div>
        `).join('');
    }

    handleProgressUpdate(data, steps) {
        if (data.type === 'progress') {
            this.processingStatus.textContent = data.message;
            this.progressFill.style.width = `${data.progress}%`;

            // Update step status
            const currentStep = steps.find(s => s.progress >= data.progress);
            if (currentStep) {
                document.querySelectorAll('.processing-step').forEach(el => {
                    const stepId = el.dataset.step;
                    const step = steps.find(s => s.id === stepId);

                    if (step.progress < data.progress) {
                        el.classList.add('completed');
                        el.classList.remove('active');
                        el.querySelector('.step-icon').textContent = '✓';
                    } else if (step.id === currentStep.id) {
                        el.classList.add('active');
                        el.classList.remove('completed');
                        el.querySelector('.step-icon').textContent = '⏳';
                    }
                });
            }
        } else if (data.type === 'complete') {
            this.specification = data.specification;
            this.rawMarkdown = data.markdown;
            this.showResults(data);
        }
    }

    showResults(data) {
        this.showSection('results');

        // Render statistics
        this.resultsStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${data.stats.sections}</span>
                <span class="stat-label">Sections</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${data.stats.wordCount}</span>
                <span class="stat-label">Words</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${data.stats.readingTime}</span>
                <span class="stat-label">Min Read</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${data.stats.fileSize}</span>
                <span class="stat-label">KB</span>
            </div>
        `;

        // Render markdown content
        this.resultsContent.innerHTML = marked.parse(this.rawMarkdown);
    }

    handleDownload() {
        const blob = new Blob([this.rawMarkdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `specification-${Date.now()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleNewSpec() {
        this.currentStep = 'goal';
        this.goal = '';
        this.sessionId = null;
        this.analysis = null;
        this.questions = [];
        this.answers = {};
        this.currentQuestionIndex = 0;
        this.followUpRound = 0;
        this.inFollowUpMode = false;
        this.inDeveloperMode = false;
        this.justFinishedFollowUp = false;
        this.specification = '';
        this.rawMarkdown = '';

        this.goalInput.value = '';
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Generation';

        this.showSection('goal');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SpecBakerApp();
});

// Made with Bob
