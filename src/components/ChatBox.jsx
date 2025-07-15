import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import prompt from "./Prompt.jsx";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const chatRef = useRef(null);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
  }, [darkMode]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, loading]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setShowIntro(false);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3-70b-8192",
          messages: [
            { 
              role: "system", 
              content: prompt
            },
            ...newMessages,
          ],
        }),
      });

      const data = await res.json();
      const reply = data.choices[0].message;
      setMessages([...newMessages, reply]);
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`chat-root ${darkMode ? 'dark' : ''}`}>
      <div className="navbar">
        <div className="logo-container">
          <img src="/rubix-logo.png" alt="Rubix Logo" className="logo" />
          <span className="app-name">Rubix</span>
        </div>
        <button className="toggle-btn" onClick={toggleDarkMode}>
          {darkMode ? (
            <>
              <span className="icon">☀️</span>
              <span className="text">Light</span>
            </>
          ) : (
            <>
              <span className="icon">🌙</span>
              <span className="text">Dark</span>
            </>
          )}
        </button>
      </div>

      {showIntro ? (
        <div className="intro-screen">
          <div className="intro-content">
            <img 
              src="/rubix-logo.png" 
              alt="Rubix Logo" 
              className="intro-logo" 
            />
            <h1 className="intro-title">Hi, I'm Rubix</h1>
            <p className="intro-subtitle">How can I assist you today?</p>
            <div className="input-container">
              <input
                type="text"
                value={input}
                placeholder="Ask me anything..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="intro-input"
              />
              <button 
                onClick={sendMessage} 
                disabled={loading}
                className="intro-send-btn"
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <span>Send</span>
                )}
              </button>
            </div>
            <div className="suggestions">
              <p>Try asking:</p>
              <div className="suggestion-chips">
                <button className="chip">What can you do?</button>
                <button className="chip">Tell me a joke</button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="chat-container">
          <div className="chat-box" ref={chatRef}>
            {messages.length === 0 && (
              <div className="empty-state">
                <img 
                  src="/rubix-logo.png" 
                  alt="Rubix Logo" 
                  className="empty-logo" 
                />
                <h2>How can I help you today?</h2>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                <div className="message-content">
                  {msg.role === 'assistant' && (
                    <div className="message-header">
                      <span className="bot-name">Rubix</span>
                    </div>
                  )}
                  <div className="message-text">
                    {msg.content}
                  </div>
                  <div className="message-time">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-content">
                  <div className="message-header">
                    <span className="bot-name">Rubix</span>
                  </div>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-container">
            <input
              type="text"
              value={input}
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="chat-input"
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()}
              className="send-btn"
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBox;