(function() {
  'use strict';

  // Cosmic Chat Widget standalone JavaScript implementation
  class CosmicChatWidget {
    constructor(config) {
      this.config = {
        position: 'bottom-right',
        primaryColor: '#3B82F6',
        greeting: 'Hello! How can I help you today?',
        title: 'Chat Support',
        placeholder: 'Type your message...',
        allowFileUpload: true,
        maxMessages: 50,
        ...config
      };

      this.isOpen = false;
      this.session = this.loadSession() || this.createSession();
      this.currentStreamingMessage = null;
      this.isLoading = false;

      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.attachEventListeners();
      
      // Add greeting message if new session
      if (this.session.messages.length === 0) {
        this.addMessage('assistant', this.config.greeting);
      }
    }

    injectStyles() {
      const styles = `
        .cosmic-chat-widget {
          position: fixed;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .cosmic-chat-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .cosmic-chat-button:hover {
          transform: scale(1.05);
        }
        .cosmic-chat-window {
          width: 384px;
          max-width: calc(100vw - 20px);
          height: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          display: none;
          flex-direction: column;
          border: 1px solid #e5e7eb;
        }
        .cosmic-chat-window.open {
          display: flex;
        }
        .cosmic-chat-header {
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
          border-radius: 8px 8px 0 0;
        }
        .cosmic-chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .cosmic-chat-message {
          max-width: 80%;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }
        .cosmic-chat-message.user {
          background: #3B82F6;
          color: white;
          margin-left: auto;
        }
        .cosmic-chat-message.assistant {
          background: #f3f4f6;
          color: #374151;
          margin-right: auto;
        }
        .cosmic-chat-input-area {
          padding: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          gap: 8px;
          align-items: end;
        }
        .cosmic-chat-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          resize: none;
          max-height: 80px;
        }
        .cosmic-chat-input:focus {
          border-color: #3B82F6;
        }
        .cosmic-chat-send {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cosmic-chat-send:disabled {
          background: #d1d5db !important;
          cursor: not-allowed;
        }
        .cosmic-typing {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-right: auto;
          max-width: 80%;
        }
        .cosmic-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #9ca3af;
          animation: cosmic-typing 1.5s infinite;
        }
        .cosmic-typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .cosmic-typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes cosmic-typing {
          0%, 60% { opacity: 1; }
          30% { opacity: 0.5; }
        }
        .cosmic-widget-bottom-right { bottom: 20px; right: 20px; }
        .cosmic-widget-bottom-left { bottom: 20px; left: 20px; }
        .cosmic-widget-top-right { top: 20px; right: 20px; }
        .cosmic-widget-top-left { top: 20px; left: 20px; }
        @media (max-width: 640px) {
          .cosmic-chat-window { height: 400px; }
          .cosmic-widget-bottom-right, .cosmic-widget-bottom-left { 
            bottom: 10px; right: 10px; left: 10px; 
          }
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = styles;
      document.head.appendChild(styleSheet);
    }

    createWidget() {
      const widget = document.createElement('div');
      widget.className = `cosmic-chat-widget cosmic-widget-${this.config.position}`;
      widget.innerHTML = `
        <button class="cosmic-chat-button" style="background-color: ${this.config.primaryColor}">
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
          </svg>
        </button>
        <div class="cosmic-chat-window">
          <div class="cosmic-chat-header" style="background-color: ${this.config.primaryColor}">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${this.config.title}</h3>
            <button class="cosmic-close-btn" style="background: none; border: none; color: rgba(255,255,255,0.8); cursor: pointer; font-size: 20px; line-height: 1;">&times;</button>
          </div>
          <div class="cosmic-chat-messages"></div>
          <div class="cosmic-chat-input-area">
            <textarea class="cosmic-chat-input" placeholder="${this.config.placeholder}" rows="1"></textarea>
            <button class="cosmic-chat-send" style="background-color: ${this.config.primaryColor}">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.widget = widget;
      this.renderMessages();
    }

    attachEventListeners() {
      const button = this.widget.querySelector('.cosmic-chat-button');
      const closeBtn = this.widget.querySelector('.cosmic-close-btn');
      const input = this.widget.querySelector('.cosmic-chat-input');
      const sendBtn = this.widget.querySelector('.cosmic-chat-send');

      button.addEventListener('click', () => this.toggle());
      closeBtn.addEventListener('click', () => this.toggle());
      sendBtn.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 80) + 'px';
      });
    }

    toggle() {
      this.isOpen = !this.isOpen;
      const window = this.widget.querySelector('.cosmic-chat-window');
      window.classList.toggle('open', this.isOpen);
      
      if (this.isOpen) {
        this.widget.querySelector('.cosmic-chat-input').focus();
      }
    }

    async sendMessage() {
      const input = this.widget.querySelector('.cosmic-chat-input');
      const message = input.value.trim();
      
      if (!message || this.isLoading) return;

      this.addMessage('user', message);
      input.value = '';
      input.style.height = 'auto';
      this.isLoading = true;
      this.updateSendButton();

      // Show typing indicator
      this.showTypingIndicator();

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: this.session.messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            maxTokens: 500
          })
        });

        if (!response.ok) throw new Error('Failed to get response');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  assistantMessage += parsed.text;
                  this.updateTypingMessage(assistantMessage);
                }
              } catch (e) {
                console.warn('Failed to parse:', data);
              }
            }
          }
        }

        this.hideTypingIndicator();
        if (assistantMessage) {
          this.addMessage('assistant', assistantMessage);
        }

      } catch (error) {
        console.error('Chat error:', error);
        this.hideTypingIndicator();
        this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      } finally {
        this.isLoading = false;
        this.updateSendButton();
      }
    }

    addMessage(role, content) {
      const message = {
        id: Math.random().toString(36).substring(2),
        role,
        content,
        timestamp: new Date()
      };

      this.session.messages.push(message);
      this.session.updatedAt = new Date();
      this.saveSession();
      this.renderMessages();
    }

    renderMessages() {
      const container = this.widget.querySelector('.cosmic-chat-messages');
      container.innerHTML = '';

      this.session.messages.forEach(message => {
        const div = document.createElement('div');
        div.className = `cosmic-chat-message ${message.role}`;
        div.innerHTML = message.content.replace(/\n/g, '<br>');
        container.appendChild(div);
      });

      container.scrollTop = container.scrollHeight;
    }

    showTypingIndicator() {
      const container = this.widget.querySelector('.cosmic-chat-messages');
      const typing = document.createElement('div');
      typing.className = 'cosmic-typing cosmic-typing-indicator';
      typing.innerHTML = `
        <div class="cosmic-typing-dot"></div>
        <div class="cosmic-typing-dot"></div>
        <div class="cosmic-typing-dot"></div>
        <span style="margin-left: 8px; font-size: 12px; color: #6b7280;">AI is typing...</span>
      `;
      container.appendChild(typing);
      container.scrollTop = container.scrollHeight;
    }

    updateTypingMessage(content) {
      const typing = this.widget.querySelector('.cosmic-typing-indicator');
      if (typing) {
        typing.className = 'cosmic-chat-message assistant';
        typing.innerHTML = content.replace(/\n/g, '<br>');
        this.widget.querySelector('.cosmic-chat-messages').scrollTop = 
          this.widget.querySelector('.cosmic-chat-messages').scrollHeight;
      }
    }

    hideTypingIndicator() {
      const typing = this.widget.querySelector('.cosmic-typing-indicator');
      if (typing) {
        typing.remove();
      }
    }

    updateSendButton() {
      const btn = this.widget.querySelector('.cosmic-chat-send');
      btn.disabled = this.isLoading;
      btn.style.backgroundColor = this.isLoading ? '#d1d5db' : this.config.primaryColor;
    }

    createSession() {
      return {
        id: Math.random().toString(36).substring(2),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    saveSession() {
      localStorage.setItem('cosmic-chat-session', JSON.stringify(this.session));
    }

    loadSession() {
      try {
        const stored = localStorage.getItem('cosmic-chat-session');
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            ...parsed,
            createdAt: new Date(parsed.createdAt),
            updatedAt: new Date(parsed.updatedAt),
            messages: parsed.messages.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          };
        }
      } catch (e) {
        console.warn('Failed to load chat session:', e);
      }
      return null;
    }
  }

  // Global initialization function
  window.CosmicChatWidget = {
    init: function(config) {
      if (!config.bucketSlug) {
        console.error('CosmicChatWidget: bucketSlug is required');
        return;
      }
      
      new CosmicChatWidget(config);
    }
  };
})();