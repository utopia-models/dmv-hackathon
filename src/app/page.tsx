import type { CSSProperties } from "react";
import ReviewOverlay from "./ReviewOverlay";
import SlideMedia from "./SlideMedia";

/*
 * RAW — 8-slide scroll-snap pitch deck (DMV Hackathon Track 04).
 * Full-bleed sections, one line of text per slide, warm-dark ground.
 * Background media is optional: drop a file at /public/slides/<n>.{webp,mp4}
 * and it swaps in; if absent, the panel + line still render (never breaks).
 */

const TINT = {
  umber: "rgba(41,30,22,0.55)",
  rodeo: "rgba(74,54,38,0.5)",
  cactus: "rgba(107,82,54,0.42)",
  tan: "rgba(156,128,92,0.34)",
  sand: "rgba(196,170,130,0.28)",
} as const;

const tint = (c: string) => ({ "--tint": c } as CSSProperties);

/* Slide 7 — the focused-phone lineup. v0 is REAL/shipping today; the other three are the roadmap. */
const DEVICES: {
  name: string;
  for: string;
  allowed: string;
  removed: string;
  real?: boolean;
}[] = [
  {
    name: "v0 · Engineering",
    for: "Tyler",
    allowed: "Phone · Messages · Gmail · Drive · Claude · WhatsApp · Telegram · Tailscale · Termux · GitHub",
    removed: "browser · store · feeds",
    real: true,
  },
  {
    name: "Doctor",
    for: "clinicians",
    allowed:
      "Epic EHR · OpenEvidence clinical AI (HIPAA) · UpToDate · MDCalc · TigerConnect paging · Doximity dialer · on-call schedule",
    removed: "social · feeds · browser — if it buzzes, it's a page",
  },
  {
    name: "Lawyer",
    for: "litigators",
    allowed:
      "Westlaw · CoCounsel legal AI · Clio matters & deadlines · NetDocuments · DocuSign · Signal (privileged comms)",
    removed: "social · feeds · browser — every minute on it is billable",
  },
  {
    name: "Kid",
    for: "students",
    allowed: "learning apps · calls to family · camera",
    removed: "all feeds · store · browser",
  },
];

export default function Home() {
  return (
    <>
      <nav className="dots" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => (
          <a key={i} href={`#s${i + 1}`} />
        ))}
      </nav>

      <main className="deck">
        {/* 1 · Hero */}
        <ReviewOverlay />
        <section id="s1" className="slide" style={tint(TINT.rodeo)}>
          <SlideMedia src="/slides/1.mp4" kind="video" alt="The RAW phone in use" />
          <div className="slide-body">
            <span className="kicker">The product</span>
            <p className="line">This is RAW.</p>
          </div>
        </section>

        {/* 2 · Problem */}
        <section id="s2" className="slide" style={tint(TINT.umber)}>
          <SlideMedia src="/slides/2.mp4" kind="video" alt="" />
          <div className="slide-body">
            <span className="kicker">The problem</span>
            <p className="line">One device tries to be everything.</p>
          </div>
        </section>

        {/* 3 · Product */}
        <section id="s3" className="slide" style={tint(TINT.cactus)}>
          <SlideMedia src="/slides/3.png" alt="A RAW phone alone in negative space" />
          <div className="slide-body">
            <p className="line">It&rsquo;s not what you can do.<br />It&rsquo;s what you can&rsquo;t.</p>
          </div>
        </section>

        {/* 4 · Thesis */}
        <section id="s4" className="slide" style={tint(TINT.tan)}>
          <SlideMedia src="/slides/4.png" alt="" />
          <div className="slide-body">
            <span className="kicker">The thesis</span>
            <p className="line">The shift already started.<br />Nobody built the device.</p>
          </div>
        </section>

        {/* 5 · How it's built — LIVE OCC embed (real proof, never a generated image).
            The poster behind the iframe is a REAL screenshot of the same page (rip-engine
            doctrine: real images only) — it shows while the embed loads, if venue wifi
            dies, and on small screens where the responsive iframe collapses to soup. */}
        <section id="s5" className="slide" style={tint(TINT.rodeo)}>
          <div className="slide-body slide-body--occ">
            <span className="kicker">How it&rsquo;s built</span>
            <p
              className="line"
              style={{ fontSize: "clamp(1.6rem,5vw,3.4rem)", marginBottom: "clamp(1rem,3vh,2rem)" }}
            >
              A founder and an AI fleet. In public.
            </p>
            <div
              className="occ-frame"
              style={{
                backgroundImage: "url(/slides/5-occ-poster.png)",
                backgroundSize: "cover",
                backgroundPosition: "top center",
              }}
            >
              <iframe
                className="occ-live"
                src="https://www.utopiamodels.ai"
                title="Utopia Models — the live fleet operations center"
                loading="lazy"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
            <p className="note">
              live &middot;{" "}
              <a href="https://www.utopiamodels.ai" target="_blank" rel="noreferrer">
                utopiamodels.ai
              </a>
            </p>
          </div>
        </section>

        {/* 6 · Traction */}
        <section id="s6" className="slide" style={tint(TINT.cactus)}>
          <SlideMedia src="/slides/6.png" alt="" />
          <div className="slide-body">
            <span className="kicker">v0 &mdash; built for one engineer</span>
            <p className="line">Ten apps. Built for one engineer.</p>
          </div>
        </section>

        {/* 7 · Market — the focused-phone lineup (typographic; the info IS the visual) */}
        <section id="s7" className="slide" style={tint(TINT.sand)}>
          <div className="slide-body slide-body--lineup">
            <div className="lineup-head">
              <span className="kicker">The market</span>
              <p className="line">Every profession gets its own.</p>
            </div>
            <div className="lineup">
              {DEVICES.map((d) => (
                <div key={d.name} className={`device${d.real ? " device--real" : ""}`}>
                  <span className="device-tag">{d.real ? "● Real — shipping today" : "Roadmap"}</span>
                  <h3 className="device-name">{d.name}</h3>
                  <span className="device-for">for {d.for}</span>
                  <span className="spec-k">Allowed</span>
                  <p className="spec-v">{d.allowed}</p>
                  <span className="spec-k">Removed</span>
                  <p className="spec-v spec-v--removed">{d.removed}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8 · Ask (closing) */}
        <section id="s8" className="slide" style={tint(TINT.rodeo)}>
          <SlideMedia src="/slides/8.png" alt="" />
          <div className="slide-body">
            <h2 className="wordmark wordmark--sand">RAW</h2>
            <p className="line" style={{marginTop:"1.2rem"}}>Building is cool.</p>
            <p className="note">a rebrand of the Nothing phone &middot; rip &rarr; repurpose, in the open</p>
          </div>
        </section>
      </main>
    </>
  );
}
