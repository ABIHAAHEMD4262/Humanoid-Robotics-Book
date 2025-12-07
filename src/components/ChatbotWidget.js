import React, { useState, useEffect, useRef } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

function ChatbotWidget() {
  const { siteConfig } = useDocusaurusContext();
  const chatbotApiUrl = siteConfig.customFields?.chatbotApiUrl || 'http://localhost:8000';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect text selection on the page
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (text && text.length > 0 && text.length < 500) {
        setSelectedText(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();

    // Check if it's a greeting
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    const isGreeting = greetings.some(g => userMessage.toLowerCase().includes(g));

    // Build query with context if text is selected
    let queryText = userMessage;
    let displayMessage = userMessage;

    if (selectedText && selectedText.length > 0) {
      queryText = `Context from book: "${selectedText}"\n\nQuestion: ${userMessage}`;
      displayMessage = `${userMessage}\n\n📄 Selected text: "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"`;
    }

    setInputValue('');
    setSelectedText(''); // Clear selected text after use
    setMessages(prev => [...prev, { role: 'user', content: displayMessage }]);
    setIsLoading(true);

    try {
      // Handle greetings without API call
      if (isGreeting && !selectedText) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "Hello! 👋 I'm your Physical AI & Humanoid Robotics assistant. I can help you with:\n\n• Understanding ROS 2 concepts\n• URDF and robot modeling\n• Simulation with Gazebo and Isaac Sim\n• Vision-Language-Action models\n• And much more!\n\nTry asking me a question about the book, or select any text from the page and ask me to explain it!",
          isGreeting: true
        }]);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${chatbotApiUrl}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query_text: queryText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer.answer_text,
        citations: data.answer.citations || [],
        confidence: data.answer.confidence_score
      }]);
    } catch (error) {
      console.error('Error querying chatbot:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend is running.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          color: 'white',
          fontSize: '24px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '90px',
            right: '20px',
            top: 'auto',
            width: '380px',
            maxHeight: 'calc(100vh - 120px)',
            height: '600px',
            background: 'var(--ifm-background-color)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid var(--ifm-color-emphasis-200)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              fontWeight: 'bold',
              fontSize: '18px',
            }}
          >
            Physical AI Assistant
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {messages.length === 0 && (
              <div style={{ padding: '12px' }}>
                <div style={{
                  color: 'var(--ifm-color-emphasis-800)',
                  textAlign: 'center',
                  marginBottom: '20px',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                  👋 Physical AI Assistant
                </div>
                <div style={{
                  color: 'var(--ifm-color-emphasis-600)',
                  fontSize: '14px',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  Ask me anything about the book! Try these:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { q: "What is ROS 2?", icon: "🤖" },
                    { q: "Explain URDF and robot modeling", icon: "📐" },
                    { q: "How do I set up Gazebo simulation?", icon: "🎮" },
                    { q: "What are Vision-Language-Action models?", icon: "👁️" }
                  ].map((faq, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInputValue(faq.q);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--ifm-color-emphasis-300)',
                        background: 'var(--ifm-color-emphasis-100)',
                        color: 'var(--ifm-font-color-base)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '13px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--ifm-color-emphasis-200)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--ifm-color-emphasis-100)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {faq.icon} {faq.q}
                    </button>
                  ))}
                </div>
                <div style={{
                  marginTop: '16px',
                  padding: '10px',
                  background: 'var(--ifm-color-emphasis-100)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--ifm-color-emphasis-700)',
                  borderLeft: '3px solid #667eea'
                }}>
                  💡 <strong>Tip:</strong> Select any text from the book page and ask me to explain it!
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'fadeIn 0.3s ease-in',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : msg.error
                      ? '#fee'
                      : 'var(--ifm-color-emphasis-100)',
                    color: msg.role === 'user' ? 'white' : 'var(--ifm-font-color-base)',
                    wordWrap: 'break-word',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    boxShadow: msg.role === 'user'
                      ? '0 2px 8px rgba(102, 126, 234, 0.3)'
                      : '0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {msg.content}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    background: 'var(--ifm-color-emphasis-50)',
                    borderRadius: '8px',
                    border: '1px solid var(--ifm-color-emphasis-200)',
                  }}>
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'var(--ifm-color-emphasis-700)',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📚 Sources ({msg.citations.length})
                    </div>
                    {msg.citations.map((citation, i) => (
                      <a
                        key={i}
                        href={citation.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'block',
                          padding: '8px',
                          marginBottom: i < msg.citations.length - 1 ? '6px' : '0',
                          background: 'var(--ifm-background-color)',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          border: '1px solid var(--ifm-color-emphasis-200)',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--ifm-color-emphasis-200)';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          fontSize: '13px',
                          color: '#667eea',
                          fontWeight: '500',
                          marginBottom: '4px'
                        }}>
                          📖 {citation.section_title}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--ifm-color-emphasis-600)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>{citation.chapter_title}</span>
                          <span style={{
                            background: 'var(--ifm-color-emphasis-200)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px'
                          }}>
                            {(citation.relevance_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--ifm-color-emphasis-100)',
                  color: 'var(--ifm-color-emphasis-600)',
                }}
              >
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: '16px',
              borderTop: '1px solid var(--ifm-color-emphasis-200)',
            }}
          >
            {/* Selected text indicator */}
            {selectedText && (
              <div
                style={{
                  marginBottom: '8px',
                  padding: '8px',
                  background: 'var(--ifm-color-emphasis-100)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--ifm-color-emphasis-700)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>📄 Text selected: "{selectedText.substring(0, 50)}..."</span>
                <button
                  onClick={() => setSelectedText('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '0 4px',
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedText ? "Ask about selected text..." : "Type your question..."}
                disabled={isLoading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--ifm-color-emphasis-300)',
                  background: 'var(--ifm-background-color)',
                  color: 'var(--ifm-font-color-base)',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputValue.trim() ? 0.5 : 1,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotWidget;
