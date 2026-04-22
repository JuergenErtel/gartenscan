"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Leaf, Mic, Send, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Chip } from "@/components/ui/Chip";
import {
  COACH_INITIAL,
  COACH_SUGGESTIONS,
  findCoachResponse,
} from "@/lib/mock/coach";
import type { CoachMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROACTIVE_PROMPTS = [
  {
    title: "7-Tage-Plan",
    text: "Priorisiere meine offenen Problemfaelle fuer diese Woche",
  },
  {
    title: "Bio zuerst",
    text: "Welche Loesung ist bio und haustierfreundlich?",
  },
  {
    title: "Schnell wirksam",
    text: "Welche Massnahme bringt heute am schnellsten Wirkung?",
  },
] as const;

export default function CoachPage() {
  return (
    <Suspense fallback={<CoachShell loading />}>
      <CoachPageInner />
    </Suspense>
  );
}

function CoachPageInner() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<CoachMessage[]>(COACH_INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const consumedQueryRef = useRef<string | null>(null);

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

    setMessages((existing) => [...existing, userMsg]);
    setInput("");
    setTyping(true);

    window.setTimeout(() => {
      const response = findCoachResponse(content);
      const assistantMsg: CoachMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        createdAt: new Date(),
      };
      setMessages((existing) => [...existing, assistantMsg]);
      setTyping(false);
    }, 900);
  };

  useEffect(() => {
    const prompt = searchParams.get("q")?.trim();
    if (!prompt) return;
    if (consumedQueryRef.current === prompt) return;
    consumedQueryRef.current = prompt;
    sendMessage(prompt);
  }, [searchParams]);

  return (
    <CoachShell
      messages={messages}
      input={input}
      typing={typing}
      scrollRef={scrollRef}
      onInputChange={setInput}
      onSend={sendMessage}
    />
  );
}

function CoachShell({
  loading,
  messages = COACH_INITIAL,
  input = "",
  typing = false,
  scrollRef,
  onInputChange,
  onSend,
}: {
  loading?: boolean;
  messages?: CoachMessage[];
  input?: string;
  typing?: boolean;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onInputChange?: (value: string) => void;
  onSend?: (value: string) => void;
}) {
  return (
    <AppShell>
      <div className="sticky top-0 z-20 border-b border-sage-200/60 bg-sage-50/90 backdrop-blur-md safe-top">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-moss-500 to-forest-700">
            <Leaf className="h-5 w-5 text-paper" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-moss-500 ring-2 ring-sage-50 anim-breath" />
          </div>
          <div className="flex-1">
            <p className="font-serif text-[16px] leading-tight text-forest-900 font-normal">
              Gartencoach
            </p>
            <p className="flex items-center gap-1 text-[11px] text-moss-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-500" />
              Entscheidet mit statt nur zu chatten
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-sage-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-forest-800">
            <Sparkles className="h-3 w-3" />
            Beta
          </div>
        </div>

        <div className="px-5 pb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-[11px] text-forest-800">
            <span className="opacity-60">Kontext:</span> Dein Garten, Muenchen,
            April
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="px-5 pt-5 pb-4 space-y-4">
        {!loading && messages.length <= 1 && (
          <section className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Starte mit einer echten Entscheidung
            </p>
            <div className="grid grid-cols-1 gap-3">
              {PROACTIVE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.title}
                  onClick={() => onSend?.(prompt.text)}
                  className="rounded-[18px] border border-sage-200 bg-paper p-4 text-left shadow-[0_2px_10px_rgba(28,42,33,0.04)] transition hover:border-forest-700/30"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-100">
                      {prompt.title === "7-Tage-Plan" ? (
                        <Sparkles className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
                      ) : prompt.title === "Bio zuerst" ? (
                        <ShieldCheck className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
                      ) : (
                        <Zap className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
                      )}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-forest-900">
                        {prompt.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
                        {prompt.text}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {messages.map((message, index) => (
          <MessageBubble key={message.id} message={message} delay={index * 0.05} />
        ))}
        {typing && <TypingIndicator />}
      </div>

      {!loading && messages.length <= 2 && (
        <div className="pt-2 pb-3">
          <p className="mb-3 px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
            Frag mich z. B.
          </p>
          <div className="overflow-x-auto scroll-hidden">
            <div className="flex w-max gap-2 px-5 pb-1">
              {COACH_SUGGESTIONS.map((suggestion) => (
                <Chip key={suggestion} onClick={() => onSend?.(suggestion)}>
                  {suggestion}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 pb-[calc(env(safe-area-inset-bottom)+5.75rem)]">
        <div className="mx-auto max-w-lg px-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSend?.(input);
            }}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-sage-200 bg-paper p-1.5 shadow-[0_8px_24px_rgba(28,42,33,0.1)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100">
              <Leaf className="h-4 w-4 text-moss-600" strokeWidth={1.75} />
            </div>
            <input
              value={input}
              onChange={(event) => onInputChange?.(event.target.value)}
              placeholder="Frag nach Wirkung, Risiko oder bester Option..."
              className="flex-1 bg-transparent text-[14px] text-forest-900 placeholder:text-ink-soft focus:outline-none"
            />
            {input.trim() ? (
              <button
                type="submit"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-700 text-paper transition hover:bg-forest-800 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-100 text-forest-700 transition hover:bg-sage-200 active:scale-95"
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
          "max-w-[82%] rounded-[20px] px-4 py-3",
          isUser
            ? "rounded-br-md bg-forest-700 text-paper"
            : "rounded-bl-md bg-paper text-forest-900 shadow-[0_2px_10px_rgba(28,42,33,0.04)]"
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
          <div className="mt-3 flex items-center gap-1.5 border-t border-sage-100 pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Bezieht sich auf
            </span>
            {message.citations.map((citation) => (
              <span
                key={citation}
                className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] text-forest-800"
              >
                {citation.replace("plant_", "")}
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
      <div className="flex items-center gap-1.5 rounded-[20px] rounded-bl-md bg-paper px-4 py-3 shadow-[0_2px_10px_rgba(28,42,33,0.04)]">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="h-2 w-2 rounded-full bg-moss-500"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
