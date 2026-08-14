'use client';

import { useEffect, useRef, useState } from 'react';
import { parseInlineStyle } from '../_lib/parseInlineStyle';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close chat' : 'Ask CarPilot'}
        style={parseInlineStyle(
          `position:fixed;right:20px;bottom:20px;width:52px;height:52px;border-radius:999px;background:var(--brand);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-lg);z-index:150;`,
        )}
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div
          style={parseInlineStyle(
            'position:fixed;right:20px;bottom:84px;width:360px;max-width:calc(100vw - 40px);height:min(520px, calc(100vh - 140px));background:var(--bg);border:1px solid var(--border);border-radius:14px;box-shadow:var(--shadow-lg);z-index:150;display:flex;flex-direction:column;overflow:hidden;',
          )}
        >
          <div
            style={parseInlineStyle(
              'padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-shrink:0;',
            )}
          >
            <span style={parseInlineStyle('font:700 15px/1 var(--font-serif,serif);color:var(--fg);')}>Ask CarPilot</span>
          </div>

          <div ref={scrollRef} style={parseInlineStyle('flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;')}>
            {messages.length === 0 && (
              <div style={parseInlineStyle('color:var(--fg-faint);font-size:13px;line-height:1.6;')}>
                Ask me anything about the cars in your shortlist — budgets, AWD, hybrids, whatever you&apos;re weighing. I&apos;ll only tell you what&apos;s actually in the inventory.
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                style={parseInlineStyle(
                  m.role === 'user'
                    ? 'align-self:flex-end;max-width:85%;background:var(--brand);color:#fff;border-radius:12px 12px 2px 12px;padding:9px 13px;font-size:14px;line-height:1.5;white-space:pre-wrap;'
                    : 'align-self:flex-start;max-width:85%;background:var(--surface-card);color:var(--fg);border-radius:12px 12px 12px 2px;padding:9px 13px;font-size:14px;line-height:1.5;white-space:pre-wrap;',
                )}
              >
                {m.content}
              </div>
            ))}
            {isLoading && (
              <div
                style={parseInlineStyle(
                  'align-self:flex-start;background:var(--surface-card);color:var(--fg-faint);border-radius:12px 12px 12px 2px;padding:9px 13px;font-size:14px;',
                )}
              >
                Thinking…
              </div>
            )}
            {error && (
              <div
                style={parseInlineStyle(
                  'align-self:flex-start;background:var(--destructive-surface);border:1px solid var(--destructive-border);color:var(--destructive);border-radius:10px;padding:8px 12px;font-size:13px;',
                )}
              >
                {error}
              </div>
            )}
          </div>

          <div style={parseInlineStyle('display:flex;gap:8px;padding:12px;border-top:1px solid var(--border);flex-shrink:0;')}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask a question…"
              disabled={isLoading}
              style={parseInlineStyle(
                'flex:1;min-width:0;border:1px solid var(--border);border-radius:8px;padding:9px 12px;font-size:14px;font-family:inherit;color:var(--fg);background:var(--bg);outline:none;',
              )}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              aria-label="Send"
              style={parseInlineStyle(
                `flex-shrink:0;width:38px;height:38px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;background:${isLoading || !input.trim() ? 'var(--border)' : 'var(--brand)'};`,
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
