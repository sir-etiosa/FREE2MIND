"use client";

import { useEffect, useRef, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function Header() {
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startTimer() {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  function stopTimer() {
    if (!running) return;
    setRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSeconds(0);
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center gap-4 border-b border-line bg-surface/90 px-6 backdrop-blur">
      {/* Search */}
      <div className="relative flex flex-1 items-center">
        <svg
          className="pointer-events-none absolute left-3 text-muted"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search matters, clients, documents…"
          className="h-9 w-full max-w-sm rounded-xl border border-line bg-canvas pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-sky focus:ring-2 focus:ring-sky/20 transition"
        />
        <kbd className="ml-2 hidden rounded-lg border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] text-muted sm:inline">
          Ctrl K
        </kbd>
      </div>

      {/* Timer widget */}
      <div className="flex items-center gap-2 rounded-xl border border-line bg-canvas px-4 py-1.5">
        <span
          className={`font-mono text-sm tabular-nums transition-colors ${
            running ? "text-positive" : "text-muted"
          }`}
        >
          {formatTime(seconds)}
        </span>
        {!running ? (
          <button
            onClick={startTimer}
            title="Start timer"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-positive/10 text-positive transition hover:bg-positive/20 active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3l14 9-14 9V3z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={stopTimer}
            title="Stop timer"
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-danger/10 text-danger transition hover:bg-danger/20 active:scale-95"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <button className="btn-primary text-sm">
          Create new
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-muted transition hover:border-sky hover:text-sky"
          aria-label="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </div>
    </header>
  );
}
