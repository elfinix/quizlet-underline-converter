import React, { useState, useEffect, useRef } from "react";

// QuizletUnderlineConverter.jsx
// Single-file React component (default export) using Tailwind classes.
// Notes: This expects Tailwind CSS to be available in the project.

function convertToLine(text) {
    let linedText = "";
    for (const ch of text) {
        const c = ch;
        if (/[a-zA-Z]/.test(c)) {
            const lc = c.toLowerCase();
            if (lc === "m") {
                linedText += "___"; // widest
            } else if ("mabcedghnopqwyxz".includes(lc)) {
                linedText += "__"; // medium
            } else {
                linedText += "_"; // narrow
            }
        } else {
            linedText += c; // keep spaces / punctuation
        }
    }
    return linedText;
}

export default function QuizletUnderlineConverter() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [history, setHistory] = useState([]);
    const [copied, setCopied] = useState(false);
    const outputRef = useRef(null);

    // Load history from localStorage on mount
    useEffect(() => {
        const raw = localStorage.getItem("quizlet_underline_history_v1");
        if (raw) {
            try {
                setHistory(JSON.parse(raw));
            } catch (e) {
                console.error("Failed to parse history from localStorage", e);
            }
        }
    }, []);

    // Persist history
    useEffect(() => {
        localStorage.setItem("quizlet_underline_history_v1", JSON.stringify(history));
    }, [history]);

    function handleTransform(e) {
        e && e.preventDefault();
        const text = input.trim();
        if (!text) return;
        const dashedText = convertToLine(text);
        setOutput(dashedText);
        setHistory((h) => [{ input: text, output: dashedText, id: Date.now() }, ...h].slice(0, 50));
        setInput("");
        // move focus to output so user can click or copy
        setTimeout(() => {
            outputRef.current && outputRef.current.focus();
        }, 50);
    }

    async function handleCopy() {
        if (!output) return;
        try {
            // modern clipboard API
            await navigator.clipboard.writeText(output);
            setCopied(true);
            // visually change border by using state, and hide after blur or 1.5s
            setTimeout(() => setCopied(false), 1500);

            // optionally, create a short highlight
            outputRef.current && outputRef.current.classList.add("ring-2", "ring-green-300");
            setTimeout(() => {
                outputRef.current && outputRef.current.classList.remove("ring-2", "ring-green-300");
            }, 1400);
        } catch (err) {
            // Fallback for older browsers: select + execCommand
            try {
                if (outputRef.current) {
                    outputRef.current.select();
                    document.execCommand("copy");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }
            } catch (e) {
                console.error("Copy failed", e);
            }
        }
    }

    function handleDelete(id) {
        setHistory((h) => h.filter((it) => it.id !== id));
    }

    function handleClearHistory() {
        setHistory([]);
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 relative overflow-hidden" style={{ width: "100vw" }}>
            {/* Decorative gradient orbs (responsive sizes) */}
            <div className="pointer-events-none absolute -top-28 -left-28 w-[18rem] h-[18rem] sm:w-[24rem] sm:h-[24rem] lg:w-[28rem] lg:h-[28rem] rounded-full bg-sky-500/10 blur-3xl" />
            <div className="pointer-events-none absolute top-1/3 -right-32 w-[20rem] h-[20rem] sm:w-[26rem] sm:h-[26rem] lg:w-[32rem] lg:h-[32rem] rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="max-w-6xl mx-auto px-7 sm:px-8 md:px-10 py-10 md:py-14 relative z-10">
                <header className="mb-8 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight section-title">
                            Quizlet Underline Converter
                        </h1>
                        <p className="mt-3 text-slate-400 text-xs sm:text-sm max-w-xl leading-relaxed">
                            Instantly transform plain words into proportional underline placeholders that visually match
                            character widths. Optimized for fast copying into Quizlet sets.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-12 gap-8 lg:gap-10">
                    {/* Left panel */}
                    <div className="col-span-12 md:col-span-7 lg:col-span-8 space-y-8">
                        <div className="glass-panel glass-border p-5 sm:p-6 md:p-8 space-y-6">
                            <form onSubmit={handleTransform} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-medium text-slate-400 mb-2">
                                        Input
                                    </label>
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleTransform(e);
                                            }
                                        }}
                                        placeholder="Type a word, phrase, or sentence..."
                                        className="modern-input w-full rounded-xl p-3 sm:p-4 h-3 min-h-[3rem] sm:min-h-[3.4rem] resize-y font-medium placeholder:text-slate-500/60 focus:outline-none text-sm"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-3 sm:gap-4 items-center">
                                    <button type="submit" className="btn-primary text-sm sm:text-base px-5 cursor-pointer">
                                        Convert
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInput("");
                                            setOutput("");
                                        }}
                                        className="btn-ghost text-sm sm:text-base px-5 cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                    {copied && (
                                        <span className="text-[10px] sm:text-xs text-emerald-400 copy-indicator">
                                            Copied!
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-[10px] sm:text-xs uppercase tracking-wider font-medium text-slate-400 mb-2">
                                        Output
                                    </label>
                                    <div className="relative">
                                        <textarea
                                            ref={outputRef}
                                            readOnly
                                            value={output}
                                            id="outputText"
                                            onClick={handleCopy}
                                            className={`modern-input w-full rounded-xl p-3 sm:p-4 h-25 md:h-28 cursor-pointer font-mono text-xs sm:text-sm leading-relaxed tracking-wide ${
                                                copied ? "ring-2 ring-emerald-400/70 border-emerald-400/70" : ""
                                            }`}
                                        />
                                        <div
                                            className={`absolute top-2 sm:top-3 right-3 sm:right-4 text-emerald-300 text-[10px] sm:text-xs font-semibold transition ${
                                                copied ? "opacity-100 scale-100" : "opacity-0 scale-90"
                                            } duration-300`}
                                        >
                                            ✓ Copied
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* History */}
                    <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-5 sm:space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs sm:text-sm font-semibold tracking-wide text-slate-300">Recent History</h2>
                            <button
                                onClick={handleClearHistory}
                                className="btn-ghost text-[10px] sm:text-xs py-1 sm:py-2 cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="glass-panel glass-border p-3 sm:p-4 overflow-hidden">
                            <div className="max-h-[37vh] sm:max-h-[37vh] overflow-y-auto pr-1 sm:pr-2 space-y-3 custom-scroll">
                                {history.length === 0 && (
                                    <p className="text-[10px] sm:text-xs text-slate-500">
                                        No history yet — recent conversions will appear here.
                                    </p>
                                )}
                                {history.map((item) => (
                                    <div
                                        key={item.id}
                                        className="history-item rounded-lg p-2.5 sm:p-3 hover:shadow-md group"
                                    >
                                        <div className="flex items-start gap-2.5 sm:gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[10px] sm:text-xs font-medium text-slate-300 truncate">
                                                    {item.input.length > 90 ? item.input.slice(0, 90) + "…" : item.input}
                                                </div>
                                                <div className="mt-1 text-[9px] sm:text-[10px] text-slate-400 font-mono break-all line-clamp-2">
                                                    {item.output.length > 120
                                                        ? item.output.slice(0, 120) + "…"
                                                        : item.output}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5 sm:gap-2 items-end">
                                                <button
                                                    onClick={() => {
                                                        setOutput(item.output);
                                                        navigator.clipboard && navigator.clipboard.writeText(item.output);
                                                        setCopied(true);
                                                        setTimeout(() => setCopied(false), 1200);
                                                    }}
                                                    className="btn-ghost px-2 py-1 text-[9px] sm:text-[10px] font-medium hover:text-white cursor-pointer"
                                                >
                                                    Copy
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-[9px] sm:text-[10px] px-2 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 transition cursor-pointer font-medium"
                                                >
                                                    Del
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 sm:mt-4 text-[9px] sm:text-[10px] text-slate-500">
                                Stored locally in your browser. Keeps up to 50 entries.
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-6 md:mt-8 text-[10px] sm:text-[11px] text-slate-500 flex flex-col items-start gap-1">
                    <div className="">Tip: Tap output to copy.</div>
                    <div className="opacity-70">
                        Developed by{" "}
                        <a
                            href="https://github.com/elfinix"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/50 hover:underline"
                        >
                            @elfinix
                        </a>
                        . All rights reserved.
                    </div>
                </footer>
            </div>

            <style>{`::-moz-selection{background:rgba(55,171,249,.35);color:#fff}::selection{background:rgba(55,171,249,.35);color:#fff}`}</style>
        </div>
    );
}
