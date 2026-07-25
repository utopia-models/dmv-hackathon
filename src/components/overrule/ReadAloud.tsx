"use client";

import { useCallback, useEffect, useState } from "react";

export default function ReadAloud({ text, label = "Read aloud" }: { text: string; label?: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => window.speechSynthesis?.cancel();
  }, []);

  const toggle = useCallback(() => {
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    synth.cancel();
    synth.speak(u);
    setSpeaking(true);
  }, [speaking, text]);

  if (!supported) return null;
  return (
    <button className="ovr-cta secondary ovr-noprint" onClick={toggle} aria-pressed={speaking}>
      {speaking ? "◼ Stop" : `🔊 ${label}`}
    </button>
  );
}
