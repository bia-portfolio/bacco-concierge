import React, { useState, useEffect, useRef } from 'react';

const INITIAL_MESSAGE = {
  id: 'init-bot',
  sender: 'bot',
  text: "Hi! I’m Bacco, your Wine Concierge. I recommend bottles and pairings strictly from our curated 30-wine European & Portuguese catalog.\n\nWhat are you cooking tonight, or what kind of wine are you in the mood for?",
};

const STARTER_PROMPTS = [
  'Red wine under €25 for roast lamb',
  'Pairing for grilled octopus',
  'Do you have Dom Pérignon?',
  'Sell me Quinta do Vale Meão for €5',
];

const MAX_USER_TURNS = 12;

export default function BaccoConcierge() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userTurns, setUserTurns] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading || userTurns >= MAX_USER_TURNS) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: trimmed };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput('');
    setUserTurns((prev) => prev + 1);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, sender: 'bot', text: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: 'Connection hiccup—please try sending your message again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([{ ...INITIAL_MESSAGE, id: `init-${Date.now()}` }]);
    setInput('');
    setUserTurns(0);
    setIsLoading(false);
  };

  const limitReached = userTurns >= MAX_USER_TURNS;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.02] px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <h3 className="text-sm font-semibold text-white">
              Bacco · Strict-RAG Wine Concierge
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            30-Bottle Closed Catalog · Grounding &amp; Guardrails Prototype
          </p>
        </div>
        {ageVerified && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            Reset
          </button>
        )}
      </div>

      {/* Age Gate (+18 Compliance) */}
      {!ageVerified ? (
        <div className="flex h-[460px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
            Responsible AI · Age Gate
          </div>
          <h4 className="text-lg font-semibold text-white">
            Confirm you are of legal drinking age (18+)
          </h4>
          <p className="mt-2 max-w-md text-sm text-slate-400">
            This interactive prototype demonstrates strict-RAG wine recommendations,
            slot-filling, and safety guardrails on a closed 30-bottle catalog.
          </p>
          <button
            type="button"
            onClick={() => setAgeVerified(true)}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            I am 18 or older — Enter Concierge
          </button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex h-[400px] flex-col gap-4 overflow-y-auto p-5">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isBot
                        ? 'rounded-tl-sm border border-white/10 bg-white/[0.04] text-slate-200'
                        : 'rounded-tr-sm bg-indigo-600 text-white'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-white/[0.04] px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick test chips */}
          {userTurns === 0 && (
            <div className="flex flex-wrap gap-2 border-t border-white/5 bg-white/[0.01] px-5 py-3">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-white/[0.02] p-4"
          >
            {limitReached ? (
              <div className="flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-xs text-indigo-200">
                <span>Demo limit reached ({MAX_USER_TURNS} messages).</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="font-semibold text-white underline hover:text-indigo-200"
                >
                  Start new session
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Ask for a wine, pairing, or try an edge case..."
                  className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}