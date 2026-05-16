/**
 * Session Manager for Web Interface
 * 
 * Manages user sessions to maintain context across multiple API calls
 */

const crypto = require('crypto');
const ContextBuilder = require('../context/context-builder');

class SessionManager {
    constructor() {
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
    }

    /**
     * Create a new session
     */
    createSession(goal, analysis) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        const contextBuilder = new ContextBuilder();
        contextBuilder.initialize(goal, analysis);

        this.sessions.set(sessionId, {
            id: sessionId,
            contextBuilder,
            createdAt: Date.now(),
            lastAccessedAt: Date.now()
        });

        // Clean up old sessions
        this.cleanupOldSessions();

        return sessionId;
    }

    /**
     * Get session by ID
     */
    getSession(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.lastAccessedAt = Date.now();
            return session;
        }
        return null;
    }

    /**
     * Get context builder for a session
     */
    getContextBuilder(sessionId) {
        const session = this.getSession(sessionId);
        return session ? session.contextBuilder : null;
    }

    /**
     * Delete a session
     */
    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
    }

    /**
     * Clean up sessions older than timeout
     */
    cleanupOldSessions() {
        const now = Date.now();
        for (const [sessionId, session] of this.sessions.entries()) {
            if (now - session.lastAccessedAt > this.sessionTimeout) {
                this.sessions.delete(sessionId);
            }
        }
    }

    /**
     * Get session count
     */
    getSessionCount() {
        return this.sessions.size;
    }
}

// Singleton instance
let sessionManager = null;

function getSessionManager() {
    if (!sessionManager) {
        sessionManager = new SessionManager();
    }
    return sessionManager;
}

module.exports = { SessionManager, getSessionManager };

// Made with Bob
