"use client";

import { Suspense, useEffect, useRef, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Leaf, Mic, Send, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { BetaBadge } from "@/components/ui/BetaBadge";
import { Chip } from "@/components/ui/Chip";
import { COACH_GREETING, COACH_SUGGESTIONS } from "@/lib/coach/constants";
import { buildHistory } from "@/lib/coach/history";
import type { CoachCitation, CoachMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const INITIAL_MESSAGES: CoachMessage[] = [
  {
    id: "greeting",
    role: "assistant",
    content: COACH_GREETING,
    createdAt: new Date(),
  },
];

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
  const [messages, setMessages] = useState<CoachMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [limitInfo, setLimitInfo] = useState<{ used: number; limit: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const consumedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || typing) return;
    if (limitInfo && limitInfo.used >= limitInfo.limit) return;

    const userMsg: CoachMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: buildHistory(nextMessages) }),
      });

      if (res.status === 402) {
        const data = await res.json().catch(() => null);
        setLimitInfo({ used: data?.used ?? 3, limit: data?.limit ?? 3 });
        // Die Nachricht wurde nicht beantwortet — nicht als offener Turn stehen lassen.
        setMessages((existing) => existing.filter((m) => m.id !== userMsg.id));
        return;
      }
      if (!res.ok) {
        pushAssistant(
          "Da ist gerade etwas schiefgelaufen. Versuch es in einem Moment nochmal."
        );
        return;
      }

      const data = (await res.json()) as {
        reply: string;
        citations: CoachCitation[];
        usage: { used: number; limit: number };
      };
      setLimitInfo(data.usage);
      setMessages((existing) => [
        ...existing,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          createdAt: new Date(),
          citations: data.citations,
        },
      ]);
    } catch {
      pushAssistant("Netzwerkfehler — bitte nochmal versuchen.");
    } finally {
      setTyping(false);
    }
  };

  function pushAssistant(content: string) {
    setMessages((existing) => [
      ...existing,
      {
        // error-Prefix: lokale Fehlermeldungen sind kein Coach-Turn und gehen
        // deshalb nicht als Verlauf an die API zurueck.
        id: `error-${Date.now()}`,
        role: "assistant",
        content,
        createdAt: new Date(),
      },
    ]);
  }

  useEffect(() => {
    const prompt = searchParams.get("q")?.trim();
    if (!prompt) return;
    if (consumedQueryRef.current === prompt) return;
    consumedQueryRef.current = prompt;
    void sendMessage(prompt);
  }, [searchParams]);

  return (
    <CoachShell
      messages={messages}
      input={input}
      typing={typing}
      limitInfo={limitInfo}
      scrollRef={scrollRef}
      onInputChange={setInput}
      onSend={sendMessage}
    />
  );
}

function CoachShell({
  loading,
  messages = INITIAL_MESSAGES,
  input = "",
  typing = false,
  limitInfo,
  scrollRef,
  onInputChange,
  onSend,
}: {
  loading?: boolean;
  messages?: CoachMessage[];
  input?: string;
  typing?: boolean;
  limitInfo?: { used: number; limit: number } | null;
  scrollRef?: RefObject<HTMLDivElement | null>;
  onInputChange?: (value: string) => void;
  onSend?: (value: string) => void;
}) {
  return (
    <AppShell>
      <div className="sticky top-0 z-20 border-b border-sage-200/60 bg-linen/90 backdrop-blur-md safe-top">
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-moss-500 to-forest-700">
            <Leaf className="h-5 w-5 text-paper" strokeWidth={1.5} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-moss-500 ring-2 ring-linen anim-breath" />
          </div>
          <div className="flex-1">
            <p className="font-serif text-[16px] leading-tight text-bark-900 font-normal">
              Gartencoach
            </p>
            <p className="flex items-center gap-1 text-[11px] text-moss-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-moss-500" />
              Entscheidet mit statt nur zu chatten
            </p>
          </div>
          <BetaBadge />
        </div>
      </div>

      <div ref={scrollRef} className="px-5 pt-5 pb-4 space-y-4">
        {!loading && messages.length <= 1 && (
          <section className="space-y-3">
            <p className="eyebrow text-ink-muted">
              Starte mit einer echten Entscheidung
            </p>
            <div className="grid grid-cols-1 gap-3">
              {PROACTIVE_PROMPTS.map((prompt) => (
                <button
                  key={prompt.title}
                  onClick={() => onSend?.(prompt.text)}
                  className="rounded-lg border border-sage-200 bg-cream p-4 text-left shadow-[0_2px_10px_rgba(28,42,33,0.04)] transition hover:border-forest-700/30"
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
                      <p className="text-[14px] font-semibold text-bark-900">
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
        {limitInfo && limitInfo.used >= limitInfo.limit && (
          <div className="rounded-lg border border-sun-500/30 bg-sun-500/10 p-4">
            <p className="text-[14px] font-semibold text-bark-900">
              Tageslimit erreicht ({limitInfo.limit} Nachrichten/Tag)
            </p>
            <p className="mt-1 text-[13px] text-ink-muted">
              Morgen geht es weiter — oder{" "}
              <a href="/premium" className="underline text-forest-700">
                Premium vormerken
              </a>{" "}
              für mehr Coach-Nachrichten.
            </p>
          </div>
        )}
        {limitInfo && limitInfo.used < limitInfo.limit && (
          <p className="text-center text-[11px] text-ink-soft">
            {limitInfo.used} von {limitInfo.limit} Nachrichten heute
          </p>
        )}
      </div>

      {!loading && messages.length <= 2 && (
        <div className="pt-2 pb-3">
          <p className="mb-3 px-5 eyebrow text-ink-muted">
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
                disabled={typing || (limitInfo ? limitInfo.used >= limitInfo.limit : false)}
                className="tap-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest-700 text-paper transition-colors hover:bg-forest-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className="tap-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-100 text-forest-700 transition-colors hover:bg-sage-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700/30 focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
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
          "max-w-[82%] rounded-lg px-4 py-3",
          isUser
            ? "rounded-br-md bg-forest-700 text-paper"
            : "rounded-bl-md bg-paper text-bark-900 shadow-[0_2px_10px_rgba(28,42,33,0.04)]"
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
                key={citation.id}
                className="rounded-full bg-sage-100 px-2 py-0.5 text-[11px] text-forest-800"
              >
                {citation.name}
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
      <div className="flex items-center gap-1.5 rounded-lg rounded-bl-md bg-paper px-4 py-3 shadow-[0_2px_10px_rgba(28,42,33,0.04)]">
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
