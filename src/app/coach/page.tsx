"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Leaf, Sparkles, Mic } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip } from "@/components/ui/Chip";
import { COACH_INITIAL, COACH_SUGGESTIONS, findCoachResponse } from "@/lib/mock/coach";
import type { CoachMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function CoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>(COACH_INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;
    const userMsg: CoachMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = findCoachResponse(content);
      const assistantMsg: CoachMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        createdAt: new Date(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setTyping(false);
    }, 1100);
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="sticky top-0 z-20 bg-sage-50/90 backdrop-blur-md border-b border-sage-200/60 safe-top">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-moss-500 to-forest-700">
            <Leaf className="h-5 w-5 text-paper" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-moss-500 ring-2 ring-sage-50 anim-breath" />
          </div>
          <div className="flex-1">
            <p className="font-serif text-[16px] leading-tight text-forest-900 font-normal">
              Gartencoach
            </p>
            <p className="text-[11px] text-moss-600 flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-500" />
              Verfügbar · Antwort in Sekunden
            </p>
          </div>
          <div className="rounded-full bg-sage-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-forest-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Beta
          </div>
        </div>

        {/* Context chip */}
        <div className="px-5 pb-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-[11px] text-forest-800">
            <span className="opacity-60">Kontext:</span> Dein Garten, München,
            April
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="px-5 pt-5 pb-4 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={m.id} message={m} delay={i * 0.05} />
        ))}
        {typing && <TypingIndicator />}
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="pt-2 pb-3">
          <p className="px-5 text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted mb-3">
            Frag mich z.B.
          </p>
          <div className="overflow-x-auto scroll-hidden">
            <div className="flex gap-2 px-5 w-max pb-1">
              {COACH_SUGGESTIONS.map((s) => (
                <Chip key={s} onClick={() => sendMessage(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[calc(env(safe-area-inset-bottom)+5.75rem)]">
        <div className="mx-auto max-w-lg px-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="pointer-events-auto flex items-center gap-2 rounded-full bg-paper shadow-[0_8px_24px_rgba(28,42,33,0.1)] border border-sage-200 p-1.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100">
              <Leaf className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Frag deinen Coach..."
              className="flex-1 bg-transparent text-[14px] text-forest-900 placeholder:text-ink-soft focus:outline-none"
            />
            {input.trim() ? (
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-700 text-paper hover:bg-forest-800 active:scale-95 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-forest-700 hover:bg-sage-200 active:scale-95 transition"
              >
                <Mic className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </form>
        </div>
      </div>
    </AppShell>
  );
}

function MessageBubble({
  message,
  delay,
}: {
  message: CoachMessage;
  delay: number;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[82%] px-4 py-3 rounded-[20px]",
          isUser
            ? "bg-forest-700 text-paper rounded-br-md"
            : "bg-paper text-forest-900 rounded-bl-md shadow-[0_2px_10px_rgba(28,42,33,0.04)]"
        )}
      >
        <p
          className={cn(
            "text-[14.5px] leading-[1.55]",
            !isUser && "font-serif font-normal"
          )}
        >
          {message.content}
        </p>
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-sage-100 flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-ink-soft font-semibold">
              Bezieht sich auf
            </span>
            {message.citations.map((c) => (
              <span
                key={c}
                className="text-[11px] rounded-full bg-sage-100 px-2 py-0.5 text-forest-800"
              >
                {c.replace("plant_", "")}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="bg-paper px-4 py-3 rounded-[20px] rounded-bl-md shadow-[0_2px_10px_rgba(28,42,33,0.04)] flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-moss-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
