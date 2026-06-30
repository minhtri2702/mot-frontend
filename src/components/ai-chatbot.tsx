"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { BookOpen, Send, Sparkles, X, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ============================================
// Types
// ============================================

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  recommendations?: MangaRecommendation[];
}

interface MangaRecommendation {
  id: string;
  title: string;
  cover: string;
  genres: string[];
  matchScore: number;
  slug: string;
}

// ============================================
// Constants
// ============================================

const SUGGESTIONS = [
  "Main bá đạo",
  "Dark fantasy",
  "Romance nhẹ nhàng",
  "Giống Solo Leveling",
  "Truyện chữa lành",
  "Main phản diện thông minh",
];

const WELCOME_TEXT = "Bạn muốn đọc gì hôm nay?";

const MOCK_RECOMMENDATIONS: MangaRecommendation[] = [
  {
    id: "1",
    title: "Solo Leveling",
    cover: "https://m.media-amazon.com/images/I/81Z7GX6G6JL._AC_UF1000,1000_QL80_.jpg",
    genres: ["Action", "Fantasy", "Adventure"],
    matchScore: 95,
    slug: "solo-leveling",
  },
  {
    id: "2",
    title: "Tomb Raider King",
    cover: "https://m.media-amazon.com/images/I/81Z7GX6G6JL._AC_UF1000,1000_QL80_.jpg",
    genres: ["Action", "Adventure", "Supernatural"],
    matchScore: 88,
    slug: "tomb-raider-king",
  },
  {
    id: "3",
    title: "The Beginning After The End",
    cover: "https://m.media-amazon.com/images/I/81Z7GX6G6JL._AC_UF1000,1000_QL80_.jpg",
    genres: ["Fantasy", "Action", "Romance"],
    matchScore: 82,
    slug: "the-beginning-after-the-end",
  },
];

// ============================================
// Sub-components
// ============================================

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shrink-0">
        <BookOpen className="h-4 w-4 text-white/60" />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
        <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" />
        <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" style={{ animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full bg-white/30 typing-dot" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}

function RecommendationCard({ manga, index }: { manga: MangaRecommendation; index: number }) {
  return (
    <Link
      href={`/truyen/${manga.slug}`}
      className="group flex gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
      style={{
        animation: `recommendCardIn 0.4s ease-out ${index * 0.15}s forwards`,
        opacity: 0,
        transform: "translateY(12px)",
      }}
    >
      {/* Cover */}
      <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 relative bg-muted">
        <Image
          src={manga.cover}
          alt={manga.title}
          fill
          sizes="56px"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-white/90 truncate group-hover:text-white transition-colors">
          {manga.title}
        </h4>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {manga.genres.slice(0, 3).map((genre) => (
            <span
              key={genre}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50"
            >
              {genre}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-white/40" />
            <span className="text-xs font-medium text-white/60">{manga.matchScore}%</span>
            <span className="text-[10px] text-white/30">match</span>
          </div>
          <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors flex items-center gap-0.5">
            Đọc ngay <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-3 px-4 py-2 ${
        isUser ? "flex-row-reverse" : ""
      }`}
      style={{
        animation: "msgFadeIn 0.35s ease-out forwards",
        opacity: 0,
        transform: `translateY(${isUser ? "-" : ""}8px)`,
      }}
    >
      {/* Avatar */}
      {isUser ? (
        <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shrink-0">
          <span className="text-xs font-medium text-white/60">M</span>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shrink-0">
          <BookOpen className="h-4 w-4 text-white/60" />
        </div>
      )}

      {/* Content */}
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        {isUser ? (
          <div className="inline-block px-4 py-2.5 rounded-2xl bg-white/[0.08] border border-white/[0.1] text-white/80 text-sm leading-relaxed">
            {message.content}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/70 text-sm leading-relaxed">
              {message.content}
            </div>
            {message.recommendations && message.recommendations.length > 0 && (
              <div className="space-y-2">
                {message.recommendations.map((manga, i) => (
                  <RecommendationCard key={manga.id} manga={manga} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Typewriter Text Component
// ============================================

function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, 35);
    return () => clearInterval(interval);
  }, [text, onComplete, done]);

  return (
    <span>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1em] bg-white/40 ml-0.5 animate-pulse align-middle" />}
    </span>
  );
}

// ============================================
// Main Chatbot Component
// ============================================

export default function AIChatbot() {
  const [phase, setPhase] = useState<"idle" | "hover" | "morphing" | "open">("idle");
  const [showPanel, setShowPanel] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHeader, setShowHeader] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase === "open") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  // === OPEN SEQUENCE ===
  const handleOpen = useCallback(() => {
    // Step 1: morph button into panel
    setPhase("morphing");
    setShowPanel(true);

    // Step 2: after morph completes, show header
    setTimeout(() => {
      setPhase("open");
      setShowHeader(true);

      // Step 3: after header, type greeting
      setTimeout(() => {
        setShowGreeting(true);

        // Step 4: after greeting typed, show suggestions
        setTimeout(() => {
          setGreetingDone(true);
          setTimeout(() => {
            setShowSuggestions(true);
            // Step 5: focus input
            setTimeout(() => {
              inputRef.current?.focus();
              setInputFocused(true);
            }, 600);
          }, 100);
        }, WELCOME_TEXT.length * 35 + 200);
      }, 350);
    }, 500);
  }, []);

  // === CLOSE SEQUENCE ===
  const handleClose = useCallback(() => {
    setPhase("morphing");
    setShowHeader(false);
    setShowGreeting(false);
    setShowSuggestions(false);
    setGreetingDone(false);
    setInputFocused(false);

    setTimeout(() => {
      setShowPanel(false);
      setPhase("idle");
      setMessages([]);
      setInput("");
    }, 450);
  }, []);

  // Simulate AI response
  const simulateAIResponse = useCallback((userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      const response: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: `Dựa trên sở thích "${userMessage}" của bạn, mình gợi ý một số truyện sau đây:`,
        recommendations: MOCK_RECOMMENDATIONS,
      };
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  }, []);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    simulateAIResponse(text);
  }, [input, isTyping, simulateAIResponse]);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: suggestion,
      };
      setMessages((prev) => [...prev, userMsg]);
      simulateAIResponse(suggestion);
    },
    [simulateAIResponse]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setShowGreeting(true);
    setGreetingDone(false);
    setTimeout(() => {
      setGreetingDone(true);
      setTimeout(() => {
        setShowSuggestions(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 600);
      }, 100);
    }, WELCOME_TEXT.length * 35 + 200);
  }, []);

  // === RENDER ===
  return (
    <>
      {/* ===== Trigger Button ===== */}
      <button
        ref={btnRef}
        onClick={phase === "idle" || phase === "hover" ? handleOpen : undefined}
        onMouseEnter={() => phase === "idle" && setPhase("hover")}
        onMouseLeave={() => phase === "hover" && setPhase("idle")}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${phase === "idle" ? "w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-lg shadow-black/20" : ""}
          ${phase === "hover" ? "w-14 h-14 rounded-full bg-white/[0.06] border border-white/[0.15] shadow-xl shadow-black/30 scale-105" : ""}
          ${phase === "morphing" ? "shadow-2xl shadow-black/50" : ""}
          ${phase === "open" ? "hidden" : ""}
          group
        `}
        style={{
          animation: phase === "idle" ? "idlePulse 3s ease-in-out infinite" : "none",
          boxShadow: phase === "morphing"
            ? "0 0 30px rgba(255,255,255,0.1), 0 25px 60px rgba(0,0,0,0.5)"
            : phase === "hover"
            ? "0 8px 30px rgba(0,0,0,0.4)"
            : "0 4px 20px rgba(0,0,0,0.25)",
        }}
        aria-label="Mở Mọt AI"
      >
        {/* Icon */}
        <div className="relative flex items-center justify-center">
          <BookOpen
            className={`
              transition-all duration-300
              ${phase === "idle" ? "h-6 w-6 text-white/50" : ""}
              ${phase === "hover" ? "h-6 w-6 text-white/80" : ""}
            `}
          />

          {/* Label "Mọt AI" */}
          <span
            className={`
              absolute right-full mr-3 px-3 py-1.5 rounded-lg
              bg-white/[0.06] border border-white/[0.08]
              text-xs text-white/60 whitespace-nowrap
              pointer-events-none
              transition-all duration-200
              ${phase === "hover"
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2"
              }
            `}
          >
            Mọt AI
          </span>
        </div>
      </button>

      {/* ===== Backdrop ===== */}
      {(phase === "morphing" || phase === "open") && (
        <div
          className="fixed inset-0 z-[60] transition-all duration-500"
          style={{
            backgroundColor: phase === "morphing"
              ? "rgba(0,0,0,0)"
              : "rgba(0,0,0,0.35)",
            backdropFilter: phase === "morphing"
              ? "blur(0px)"
              : "blur(6px)",
            WebkitBackdropFilter: phase === "morphing"
              ? "blur(0px)"
              : "blur(6px)",
          }}
          onClick={handleClose}
        />
      )}

      {/* ===== Morphing Panel (transition from button to panel) ===== */}
      {(phase === "morphing" || phase === "open") && (
        <div
          ref={panelRef}
          className="fixed z-[70] flex flex-col overflow-hidden transition-all duration-500 ease-out"
          style={{
            // Expand from bottom-right corner
            bottom: "24px",
            right: "24px",
            width: phase === "morphing" ? "56px" : "min(420px, calc(100vw - 48px))",
            height: phase === "morphing" ? "56px" : "min(650px, calc(100vh - 48px))",
            borderRadius: phase === "morphing" ? "9999px" : "24px",
            backgroundColor: phase === "morphing" ? "rgba(24,24,27,0.6)" : "#18181B",
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: phase === "morphing" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)",
            transform: phase === "morphing" ? "translate(0, 0)" : "translate(0, 0)",
            opacity: 1,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ===== Header ===== */}
          <div
            className="shrink-0 px-5 py-4 border-b border-white/[0.06]"
            style={{
              opacity: showHeader ? 1 : 0,
              transform: showHeader ? "translateY(0)" : "translateY(-12px)",
              transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white/70" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white/90">Mọt AI</h2>
                  <p className="text-[11px] text-white/40">Khám phá truyện theo cách của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                  title="Bắt đầu lại"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="1 4 1 10 7 10" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                  </svg>
                </button>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-all"
                  title="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ===== Messages Area ===== */}
          <div className="flex-1 overflow-y-auto py-4 space-y-1 scroll-smooth">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isTyping && <TypingIndicator />}

            {/* Welcome message with typewriter */}
            {showGreeting && messages.length === 0 && !isTyping && (
              <div className="flex items-start gap-3 px-4 py-2">
                <div className="w-8 h-8 rounded-full bg-white/[0.08] border border-white/[0.1] flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4 text-white/60" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white/70 text-sm leading-relaxed">
                  <TypewriterText
                    text={WELCOME_TEXT}
                    onComplete={() => setGreetingDone(true)}
                  />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {greetingDone && messages.length === 0 && !isTyping && (
              <div className="px-4 pt-2 pb-4">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion, i) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-2 rounded-full text-sm text-white/50 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.07] hover:text-white/70 hover:border-white/[0.1] transition-all duration-200"
                      style={{
                        opacity: showSuggestions ? 1 : 0,
                        transform: showSuggestions ? "translateY(0)" : "translateY(8px)",
                        transition: `opacity 0.3s ease-out ${i * 0.08}s, transform 0.3s ease-out ${i * 0.08}s`,
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ===== Input Area ===== */}
          <div className="shrink-0 px-4 py-3 border-t border-white/[0.06]">
            <div
              className={`flex items-center gap-2 bg-white/[0.03] rounded-2xl border transition-all duration-200 px-4 py-2 ${
                inputFocused
                  ? "border-white/[0.12] bg-white/[0.05]"
                  : "border-white/[0.06]"
              }`}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Tìm truyện theo cảm xúc hoặc sở thích..."
                className="flex-1 bg-transparent text-sm text-white/70 placeholder-white/25 outline-none"
                disabled={isTyping}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.08] text-white/50 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/[0.12] hover:text-white/70 transition-all duration-200 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
