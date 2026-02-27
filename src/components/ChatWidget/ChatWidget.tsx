/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2 } from "lucide-react";
import api from "../../services/api";
import "./ChatWidget.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Xin chào! Mình là TetBot AI 🤖 Mình có thể giúp gì cho bạn?",
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
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build the conversation history to send to the API
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.post<{ data: { reply: string } }>(
        "/chat",
        { messages: history },
      );

      // api interceptor returns AxiosResponse, and our backend wraps in { data: { reply } }
      const reply =
        (response as any)?.data?.reply ??
        (response as any)?.reply ??
        "Xin lỗi, mình không hiểu. Bạn thử hỏi lại nhé!";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Có lỗi xảy ra rồi. Bạn thử lại sau nhé! 😅",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <div className={`cw-window ${isOpen ? "cw-window--open" : ""}`}>
        {/* Header */}
        <div className="cw-header">
          <div className="cw-header__info">
            <div className="cw-header__avatar">
              <img src="https://api.dicebear.com/9.x/toon-head/svg?beard[]&clothes=turtleNeck,openJacket&clothesColor=731ac3&hair=bun&hairColor=d6b370,b58143&mouth=laugh&rearHair=longStraight,neckHigh,shoulderHigh,longWavy&rearHairProbability=0&skinColor=f1c3a5&backgroundColor=ffd5dc,ffdfbf,transparent&seed=Christopher" alt="" />
            </div>
            <div>
              <h3 className="cw-header__title">TetBot AI</h3>
              <span className="cw-header__status">Online</span>
            </div>
          </div>
          <button
            className="cw-header__close"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message List */}
        <div className="cw-body">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`cw-msg ${msg.role === "user" ? "cw-msg--user" : "cw-msg--bot"}`}
            >
              {msg.role === "assistant" && (
                <div className="cw-msg__avatar">
                  <img src="https://api.dicebear.com/9.x/toon-head/svg?beard[]&clothes=turtleNeck,openJacket&clothesColor=731ac3&hair=bun&hairColor=d6b370,b58143&mouth=laugh&rearHair=longStraight,neckHigh,shoulderHigh,longWavy&rearHairProbability=0&skinColor=f1c3a5&backgroundColor=ffd5dc,ffdfbf,transparent&seed=Christopher" alt="Bot Avatar" />
                </div>
              )}
              <div className="cw-msg__bubble">{msg.content}</div>
            </div>
          ))}

          {isLoading && (
            <div className="cw-msg cw-msg--bot">
              <div className="cw-msg__avatar">
                <img src="https://api.dicebear.com/9.x/toon-head/svg?beard[]&clothes=turtleNeck,openJacket&clothesColor=731ac3&hair=bun&hairColor=d6b370,b58143&mouth=laugh&rearHair=longStraight,neckHigh,shoulderHigh,longWavy&rearHairProbability=0&skinColor=f1c3a5&backgroundColor=ffd5dc,ffdfbf,transparent&seed=Christopher" alt="Bot Avatar" />
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

        {/* Footer / Input */}
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
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="cw-footer__send"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            {isLoading ? <Loader2 size={18} className="cw-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>

      {/* ── Floating Action Button (Launcher) ── */}
      <button
        className={`cw-fab ${isOpen ? "cw-fab--active" : ""}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Toggle chat"
      >
        <img src="https://api.dicebear.com/9.x/toon-head/svg?beard[]&clothes=turtleNeck,openJacket&clothesColor=731ac3&hair=bun&hairColor=d6b370,b58143&mouth=laugh&rearHair=longStraight,neckHigh,shoulderHigh,longWavy&rearHairProbability=0&skinColor=f1c3a5&backgroundColor=ffd5dc,ffdfbf,transparent&seed=Christopher" alt="" />
        <X size={24} className="cw-fab__icon cw-fab__icon--close" />
      </button>
    </>
  );
};

export default ChatWidget;
