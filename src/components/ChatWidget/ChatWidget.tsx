/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Utensils,
  Wallet,
  Palette,
} from "lucide-react";
import api from "../../services/api";
import "./ChatWidget.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  { text: "Tet Planning", icon: <Sparkles size={12} /> },
  { text: "Recipes", icon: <Utensils size={12} /> },
  { text: "Budget Tips", icon: <Wallet size={12} /> },
  { text: "Decor Ideas", icon: <Palette size={12} /> },
];

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm TetBot AI 🤖 How can I help you prepare for the Lunar New Year?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async (customText?: string) => {
    const text = customText || input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prevents 500 error by skipping the initial bot greeting
      const history = messages
        .filter((_, index) => index > 0)
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await api.post("/ai-chat", {
        message: text,
        history: history,
      });

      const reply = response.data?.data?.reply || response.data?.reply; //

      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again! 🧧",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`cw-window ${isOpen ? "cw-window--open" : ""}`}>
        {/* Header */}
        <div className="cw-header">
          <div className="cw-header__info">
            <div className="cw-header__avatar">
              <img
                src="https://api.dicebear.com/9.x/toon-head/svg?seed=Christopher"
                alt="Bot"
              />
            </div>
            <div>
              <h3 className="cw-header__title">TetBot AI</h3>
              <span className="cw-header__status">Online</span>
            </div>
          </div>
          <button className="cw-header__close" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Message Body */}
        <div className="cw-body">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`cw-msg ${msg.role === "user" ? "cw-msg--user" : "cw-msg--bot"}`}
            >
              {msg.role === "assistant" && (
                <div className="cw-msg__avatar">
                  <img
                    src="https://api.dicebear.com/9.x/toon-head/svg?seed=Christopher"
                    alt="Avatar"
                  />
                </div>
              )}
              <div className="cw-msg__bubble">{msg.content}</div>
            </div>
          ))}

          {/* --- SOFT MINI-CHIPS SUGGESTIONS --- */}
          {messages.length === 1 && !isLoading && (
            <div className="cw-chip-wrapper">
              <div className="cw-chip-list">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    className="cw-chip"
                    onClick={() => handleSend(s.text)}
                  >
                    <span className="cw-chip-icon">{s.icon}</span>
                    {s.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="cw-msg cw-msg--bot">
              <div className="cw-msg__avatar">
                <img
                  src="https://api.dicebear.com/9.x/toon-head/svg?seed=Christopher"
                  alt="Bot"
                />
              </div>
              <div className="cw-msg__bubble cw-msg__bubble--typing">
                <span className="cw-dot" />
                <span className="cw-dot" />
                <span className="cw-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer */}
        <form
          className="cw-footer"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="cw-footer__input"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="cw-footer__send"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 size={18} className="cw-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </div>

      <button
        className={`cw-fab ${isOpen ? "cw-fab--active" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
      >
        <img
          src="https://api.dicebear.com/9.x/toon-head/svg?seed=Christopher"
          alt="FAB"
        />
        <X size={24} className="cw-fab__icon cw-fab__icon--close" />
      </button>
    </>
  );
};

export default ChatWidget;
