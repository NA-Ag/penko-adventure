/**
 * Conversation Manager
 * Handles conversation history with automatic reset on inactivity
 * Inspired by whisplay-ai-chatbot pattern: "Reset conversation after 5 minutes of inactivity"
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class ConversationManager {
  private lastActivity: number = Date.now();
  private readonly INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private conversationHistory: Message[] = [];
  private onResetCallback?: () => void;

  constructor(onReset?: () => void) {
    this.onResetCallback = onReset;
  }

  /**
   * Update last activity timestamp
   */
  updateActivity() {
    this.lastActivity = Date.now();
  }

  /**
   * Check if conversation should be reset due to inactivity
   * @returns true if conversation was reset, false otherwise
   */
  checkAndResetIfStale(): boolean {
    const timeSinceLastActivity = Date.now() - this.lastActivity;

    if (timeSinceLastActivity > this.INACTIVITY_TIMEOUT) {
      console.log('[ConversationManager] 5 minutes of inactivity detected - resetting conversation');
      console.log(`[ConversationManager] Cleared ${this.conversationHistory.length} messages`);

      this.conversationHistory = [];
      this.updateActivity();

      if (this.onResetCallback) {
        this.onResetCallback();
      }

      return true; // Conversation was reset
    }

    return false; // Conversation still active
  }

  /**
   * Add a message to conversation history
   * Automatically checks for staleness before adding
   */
  addMessage(role: 'system' | 'user' | 'assistant', content: string) {
    this.checkAndResetIfStale(); // Auto-check on every message

    this.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });

    this.updateActivity();
  }

  /**
   * Get full conversation history
   */
  getHistory(): Message[] {
    return this.conversationHistory;
  }

  /**
   * Get conversation history formatted for API requests
   * (removes timestamps, just role + content)
   */
  getHistoryForAPI(): Array<{ role: string; content: string }> {
    return this.conversationHistory.map(({ role, content }) => ({
      role,
      content
    }));
  }

  /**
   * Manually clear conversation history
   */
  clear() {
    console.log(`[ConversationManager] Manual reset - cleared ${this.conversationHistory.length} messages`);
    this.conversationHistory = [];
    this.updateActivity();
  }

  /**
   * Get time since last activity (for UI display)
   */
  getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivity;
  }

  /**
   * Get message count
   */
  getMessageCount(): number {
    return this.conversationHistory.length;
  }

  /**
   * Get estimated token count (rough approximation)
   * Useful for staying under model context limits
   */
  getEstimatedTokenCount(): number {
    const totalChars = this.conversationHistory.reduce(
      (acc, msg) => acc + msg.content.length,
      0
    );
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(totalChars / 4);
  }

  /**
   * Check if approaching token limit
   * @param limit - Model context limit (e.g., 4096, 8192, 128000)
   */
  isApproachingTokenLimit(limit: number = 8192): boolean {
    return this.getEstimatedTokenCount() > limit * 0.8; // 80% threshold
  }
}
