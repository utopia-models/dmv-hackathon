import type { CSSProperties } from "react";
import fs from "node:fs";
import path from "node:path";
import ReviewOverlay from "./ReviewOverlay";
import SlideMedia from "./SlideMedia";
import DeviceMedia from "./DeviceMedia";
import DeckControls from "./DeckControls";

/* ── "The marketing is me" (knowledge#2562) ──────────────────────────────
   The creatives wall globs /public/creatives at BUILD TIME (this is a server
   component). Adding a file to that folder adds a tile; removing one removes a
   tile — no code edit, no manifest entry. Empty folder → honest empty state
   (never placeholder tiles). See public/creatives/README.md. */
const IMG_EXT = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
const VID_EXT = new Set([".mp4", ".webm"]);

function readCreatives(): { src: string; kind: "image" | "video" }[] {
  const dir = path.join(process.cwd(), "public", "creatives");
  let names: string[] = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return []; // folder absent → honest empty state
  }
  return names
    .filter((n) => !n.startsWith("."))
    .map((n) => ({ n, ext: path.extname(n).toLowerCase() }))
    .filter(({ ext }) => IMG_EXT.has(ext) || VID_EXT.has(ext))
    .sort((a, b) => a.n.localeCompare(b.n))
    .map(({ n, ext }) => ({
      src: `/creatives/${n}`,
      kind: VID_EXT.has(ext) ? ("video" as const) : ("image" as const),
    }));
}

/* Tyler's Instagram — a single constant so it changes in ONE place.
   ⚠ knowledge#2562: brand handle default; Tyler confirms/corrects on the issue.
   No follower COUNT is shown — the live count needs the Instagram Graph API key
   the fleet does not hold, so per the DoD we ship the official profile CTA with
   an honest ABSENCE of a number rather than an invented one. */
const INSTAGRAM_HANDLE = "utopiamodels";

const InstagramGlyph = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
    <rect x="2.5" y="2.5" width="19" height="19" rx="5.4" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
  </svg>
);

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

/* Slide 7 — the focused-phone lineup. v0 is REAL/shipping today; the other three are the
   roadmap. Function-first bullets (judges scan, they don't parse vendor lists); v0 keeps
   its household app names — that list being checkable IS its credibility. */
/* `media` is an OPTIONAL per-card slot rendered by DeviceMedia, which shows
   NOTHING until the file exists — so v0 plays today and the three concept slots
   stay invisibly reserved until knowledge#2553's environment videos land at
   their paths (frame "wide", 16:9). Paths are mirrored in manifest.json. */
const DEVICES: {
  name: string;
  for: string;
  allowed: string[];
  removed: string;
  real?: boolean;
  media?: { src: string; kind: "image" | "video"; frame: "phone" | "wide"; alt: string };
}[] = [
  {
    name: "v0 · Engineering",
    for: "Tyler",
    allowed: [
      "Phone · Messages · Gmail",
      "Drive · GitHub · Termux · Tailscale",
      "Claude · WhatsApp · Telegram",
    ],
    removed: "browser · store · feeds",
    real: true,
    // Tyler, 2026-07-25 evening: v0 gets a 16:9 LANDSCAPE card matching the other
    // three, so the lineup reads as one row of four. The portrait phone frame
    // (used briefly here) broke that alignment — the real launcher recording
    // still plays on slide 5, where a device-shaped frame belongs.
    media: { src: "/slides/lineup-v0-market.mp4", kind: "video", frame: "wide", alt: "RAW — the engineering phone" },
  },
  {
    name: "Doctor",
    for: "clinicians",
    allowed: [
      "Patient records & charting",
      "Clinical AI — HIPAA-safe, evidence-grounded",
      "Drug & diagnosis reference",
      "Secure paging & care-team chat",
      "Patient calls from the clinic line",
      "On-call schedule",
    ],
    removed: "social · feeds · browser — if it buzzes, it's a page",
    media: { src: "/slides/lineup-doctor.mp4", kind: "video", frame: "wide", alt: "A clinic environment" },
  },
  {
    name: "Lawyer",
    for: "litigators",
    allowed: [
      "Research & document-drafting AI",
      "Client scheduling assistant",
      "Missed calls screened → consult note drafted",
      "Daily brief for your practice area",
      "Marketing autopilot — it posts, you never scroll",
      "Case files & e-signature",
      "Privileged client comms",
    ],
    removed: "social · feeds · browser — every minute is billable",
    media: { src: "/slides/lineup-lawyer.mp4", kind: "video", frame: "wide", alt: "A law-firm environment" },
  },
  {
    name: "Kid",
    for: "kids — bought by parents",
    allowed: [
      "Tutor AI — explains, never answers for them",
      "An algorithm that learns their strengths — and grows them toward work they'll love",
      "Wakes them with encouragement, not notifications",
      "Reading, homework & school planner",
      "Create — draw, write, music, code",
      "Age-safe by design — search & DNS filtered at the network",
      "Sentry mode — safety alerts straight home",
      "Calls & messages, parent-approved contacts",
      "Camera · encrypted photo library · location share with home",
    ],
    removed:
      "feeds · store · browser · stranger DMs · unapproved photo apps — the only algorithm on it works for them",
    media: { src: "/slides/lineup-kid.mp4", kind: "video", frame: "wide", alt: "A classroom environment" },
  },
];

export default function Home() {
  const creatives = readCreatives();
  return (
    <>
      {/* Right-edge progress dots + the top-right review controls (#2547).
          The dots now derive from the shared SLIDES registry so cutting a slide
          keeps the dots in sync. */}
      <DeckControls />

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
        {/* PROBLEM — the merge (Tyler, 2026-07-25). Three former slides collapsed
            into one: s2 "One device tries to be everything" (Problem) + s3
            "It's not what you can do / it's what you can't" (Product) + s4 "The
            shift already started" (Thesis). All three lines are KEPT so Tyler can
            see the argument whole and cut on screen — this is a reorder, not a
            rewrite. Kicker reads "Problem" per his instruction. */}
        <section id="s2" className="slide" style={tint(TINT.umber)}>
          {/* NO background — Tyler's call (knowledge#2582): three stacked lines on
              the warm ground; the quiet Problem slide makes the rich Solution pop.
              Its former video is now slide 3's hero. Do not substitute an asset. */}
          <div className="slide-body">
            <span className="kicker">Problem</span>
            <p className="line">One device tries to be everything.</p>
            <p className="line line--sub">
              It&rsquo;s not what you can do.<br />It&rsquo;s what you can&rsquo;t.
            </p>
            <p className="note note--merge">
              The shift already started. Nobody built the device.
            </p>
          </div>
        </section>



        {/* SOLUTION (Tyler, 2026-07-25) — slide 3 of the five shown. His words,
            placed verbatim, over the video hero promoted from slide 2 per
            knowledge#2582 (Drive: slide-3-solution/slide-3-solution-hero.mp4,
            repo: 3-solution-hero.mp4). kind="video" is REQUIRED — SlideMedia
            defaults to image probing and would silently render nothing. */}
        <section id="s-solution" className="slide" style={tint(TINT.cactus)}>
          <SlideMedia src="/slides/3-solution-hero.mp4" kind="video" alt="RAW in motion — the solution's hero video" />
          <div className="slide-body">
            <span className="kicker">Solution</span>
            <p className="line">
              Our own devices,<br />where brainrot is not possible.
            </p>
            <blockquote className="quote">
              &ldquo;I would pay for a phone that doesn&rsquo;t have apps that will distract me, only
              the apps that I need, like Claude, Messages and Phone and that&rsquo;s it.&rdquo;
            </blockquote>
          </div>
        </section>



        {/* PROOF (mms5377 — Izzu's merge, 2026-07-25 evening). The three biggest
            problem stats from the research pack, each paired with RAW's direct
            answer. Absorbs and replaces the former s-scale + s-willpower + s-fix
            ref slides (git history keeps them). Sits right after Tyler's
            Solution slide: he states the solution, this slide proves it maps. */}
        <section id="s-proof" className="slide" style={tint(TINT.tan)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">The proof</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Three failures. One fix.
            </p>
            <div className="probsol">
              <div className="ps-row">
                <div className="ps-stat mstat">
                  <div className="mnum">8<small>h</small> 39<small>m</small></div>
                  <p className="mlabel">the average teen spends on screens every day — almost half the hours they&rsquo;re awake</p>
                  <span className="msrc">Common Sense Media census</span>
                </div>
                <span className="ps-arrow" aria-hidden>&rarr;</span>
                <div className="ps-fix">
                  <h4>RAW has no feed to scroll.</h4>
                  <p>Nothing on the phone goes on forever. When the task is done, the phone is done — and those hours come back.</p>
                </div>
              </div>
              <div className="ps-row">
                <div className="ps-stat mstat">
                  <div className="mnum">237</div>
                  <p className="mlabel">times a day a teenager&rsquo;s phone interrupts them with a notification</p>
                  <span className="msrc">CSM · Univ. of Michigan 2023</span>
                </div>
                <span className="ps-arrow" aria-hidden>&rarr;</span>
                <div className="ps-fix">
                  <h4>On RAW, apps can&rsquo;t beg for attention.</h4>
                  <p>The only thing that can buzz your phone is a person — a call, a text, a page. Those still land instantly.</p>
                </div>
              </div>
              <div className="ps-row">
                <div className="ps-stat mstat">
                  <div className="mnum">17%</div>
                  <p className="mlabel">of people who try app blockers or screen-time limits say they actually work long-term</p>
                  <span className="msrc">J. Medical Internet Research 2022</span>
                </div>
                <span className="ps-arrow" aria-hidden>&rarr;</span>
                <div className="ps-fix">
                  <h4>RAW is a decision you make once.</h4>
                  <p>Blockers live on the same screen as the temptation — two taps and they&rsquo;re off. A separate phone has nothing to bypass at midnight.</p>
                </div>
              </div>
            </div>
            <p className="mfoot">
              Deletion is a decision you remake every day. <b>A separate device is a decision you make once.</b>
            </p>
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
                  {d.media && (
                    <DeviceMedia
                      src={d.media.src}
                      kind={d.media.kind}
                      frame={d.media.frame}
                      alt={d.media.alt}
                    />
                  )}
                  <span className="device-tag">{d.real ? "● Real — shipping today" : "Roadmap"}</span>
                  <h3 className="device-name">{d.name}</h3>
                  <span className="device-for">for {d.for}</span>
                  <span className="spec-k">Allowed</span>
                  <ul className="spec-list">
                    {d.allowed.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                  <span className="spec-k">Removed</span>
                  <p className="spec-v spec-v--removed">{d.removed}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5 · How it's built — LIVE OCC embed (real proof, never a generated image).
            The poster behind the iframe is a REAL screenshot of the same page (rip-engine
            doctrine: real images only) — it shows while the embed loads, if venue wifi
            dies, and on small screens where the responsive iframe collapses to soup. */}
        {/* 5 · FOUNDER (Tyler, 2026-07-25) — the whole founder argument in one
            slide. Merged in from the former s-me: the creatives wall + Instagram
            CTA. Pulled in from slide 4's lineup: the REAL v0 phone recording.
            Hierarchy is Tyler's call — founder LEADS, fleet + phone are the proof
            beneath it. The argument: here is the person → here is the machine and
            the device that let him ship. */}
        <section id="s5" className="slide" style={tint(TINT.rodeo)}>
          <div className="slide-body slide-body--founder">
            <div className="me-head">
              <span className="kicker">The founder</span>
              <p className="line">The marketing is me.</p>
              <p className="me-sub">
                The proof isn&rsquo;t a pitch. It&rsquo;s a person building in
                public &mdash; on the device, with the fleet, making the work.
              </p>
            </div>

            {creatives.length > 0 ? (
              <div className="cwall" aria-label="Creatives made this hackathon">
                {creatives.map((c) =>
                  c.kind === "video" ? (
                    <video
                      key={c.src}
                      className="cwall-tile"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    >
                      <source src={c.src} />
                    </video>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={c.src} className="cwall-tile" src={c.src} alt="" draggable={false} />
                  )
                )}
              </div>
            ) : (
              <p className="cwall-empty">the work, curated live &mdash; utopia</p>
            )}

            <p className="fleet-line">A founder and an AI fleet. In public.</p>

            {/* The two pieces of proof, side by side: the machine (live OCC) and
                the device (real Pixel 10 capture, 2026-07-25). Stacks < 820px. */}
            <div className="proof-row">
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

              <div className="device-frame device-frame--phone proof-phone">
                <video
                  className="device-media"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label="The RAW launcher on Tyler's real Pixel 10"
                >
                  <source src="/slides/lineup-v0.mp4" />
                </video>
              </div>
            </div>

            <p className="note">
              live &middot;{" "}
              <a href="https://www.utopiamodels.ai" target="_blank" rel="noreferrer">
                utopiamodels.ai
              </a>
            </p>

            <a
              className="ig-cta"
              href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
              target="_blank"
              rel="noreferrer"
            >
              <InstagramGlyph />
              <span>Follow the build</span>
              <span className="ig-handle">@{INSTAGRAM_HANDLE}</span>
            </a>
          </div>
        </section>


        {/* 3 · Product */}


        {/* Solution · the architecture kill-shot (mms5377). AFTER traction —
            why THIS model succeeds where every previous attempt failed. The
            four-architecture compare from the research pack, distilled. */}
        <section id="s-not-dumb" className="slide" style={tint(TINT.rodeo)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">Why this wins where the others died</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              All the utility. None of the vectors.
            </p>
            <div className="solgrid">
              <div className="solcard">
                <h4>Dumbphone</h4>
                <p>Kills the feeds — and banking, 2FA, and maps with them. One missing essential sends the SIM back to the smartphone.</p>
                <span className="verdict">returned</span>
              </div>
              <div className="solcard">
                <h4>Smartphone</h4>
                <p>Every tool you need, shelved next to every feed engineered against you. The default that produced 8h39m.</p>
                <span className="verdict">the problem</span>
              </div>
              <div className="solcard">
                <h4>Blocker apps</h4>
                <p>The restriction lives on the same screen as the temptation — two taps to bypass at the weakest moment.</p>
                <span className="verdict">17% stick</span>
              </div>
              <div className="solcard solcard--raw">
                <h4>RAW</h4>
                <p>The essentials stay, the feeds structurally don&rsquo;t exist. A managed device — the boundary finally holds.</p>
                <span className="verdict">● utility, zero vectors</span>
              </div>
            </div>
            <p className="mfoot">
              The &ldquo;one essential app&rdquo; problem killed the minimalist phone.
              <b> RAW keeps the essentials — so the boundary survives real life.</b>
            </p>
          </div>
        </section>

        {/* Metrics · causal proof (mms5377). The strongest evidence in the pack:
            remove the device, outcomes move. Quasi-experimental (400 middle
            schools, Norway 2024), not correlation. PARKED after the five shown —
            Tyler decides whether it belongs inside Solution. */}
        <section id="s-causal" className="slide" style={tint(TINT.cactus)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">Remove the device, and</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Everything moves.
            </p>
            <div className="mrow">
              <div className="mstat">
                <div className="mnum">&minus;43%</div>
                <p className="mlabel">bullying, after middle schools separated kids from smartphones</p>
                <span className="msrc">Norwegian ban study · NHH 2024</span>
              </div>
              <div className="mstat">
                <div className="mnum">&minus;60%</div>
                <p className="mlabel">mental-health referrals at the same schools</p>
                <span className="msrc">quasi-experimental · 400 schools</span>
              </div>
              <div className="mstat">
                <div className="mnum">GPA&nbsp;&uarr;</div>
                <p className="mlabel">measurable grade gains, strongest for girls</p>
                <span className="msrc">same study — causal, not correlation</span>
              </div>
            </div>
            <p className="mfoot">
              Not a survey. Schools changed the <b>environment</b> — and the outcomes followed.
            </p>
          </div>
        </section>




        {/* 6 · Traction */}
        {/* Metrics · demand receipts (mms5377). BEFORE the market slide —
            proof the shift is policy, law, and revenue before we show the line. */}

        <section id="s-receipts" className="slide" style={tint(TINT.sand)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">The shift has receipts</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Policy, law, and revenue agree.
            </p>
            <div className="mrow">
              <div className="mstat">
                <div className="mnum">45+</div>
                <p className="mlabel">U.S. states restricting phones in schools by 2025</p>
                <span className="msrc">incl. CA AB 3216 · VA EO 33</span>
              </div>
              <div className="mstat">
                <div className="mnum">U-16</div>
                <p className="mlabel">Australia&rsquo;s federal social-media ban for under-16s, 2025</p>
                <span className="msrc">first national law of its kind</span>
              </div>
              <div className="mstat">
                <div className="mnum">$10M</div>
                <p className="mlabel">ARR for one app blocker — 11 employees, 10M users paying for focus</p>
                <span className="msrc">Opal, 2025</span>
              </div>
              <div className="mstat">
                <div className="mnum">69%</div>
                <p className="mlabel">of U.S. adults 18&ndash;29 say they want less screen time</p>
                <span className="msrc">Pew Research, 2024</span>
              </div>
            </div>
            <p className="mfoot">
              People are paying for focus on hardware built against it. <b>Nobody sells them the device.</b>
            </p>
          </div>
        </section>


        {/* 8 · Ask (closing) */}
      </main>
    </>
  );
}
