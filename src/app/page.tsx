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
    // REAL footage from Tyler's Pixel 10 (adb capture 2026-07-25). Its
    // authenticity is the slide's whole argument — never a generated substitute.
    media: { src: "/slides/lineup-v0.mp4", kind: "video", frame: "phone", alt: "The RAW launcher on Tyler's real Pixel 10" },
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
          <SlideMedia src="/slides/2.mp4" kind="video" alt="" />
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
            placed verbatim, over the REAL launcher asset: the customer quote names
            Claude, Messages and Phone, and the launcher shows exactly those. This
            is the deleted Traction slide's evidence repurposed as the SOLUTION
            rather than "look what I built". */}
        <section id="s-solution" className="slide" style={tint(TINT.cactus)}>
          <SlideMedia src="/slides/6.png" alt="The RAW launcher — ten apps, no browser, no store" />
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

        {/* Metrics · the scale (mms5377 — research pack, all Solid-rated).
            Placed AFTER the problem slide: name the failure, then size it.
            Non-numeric id per the s-me pattern: no renumbering, no BEATS edit. */}
        <section id="s-scale" className="slide" style={tint(TINT.umber)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">The scale</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Nearly half their waking hours.
            </p>
            <div className="mrow">
              <div className="mstat">
                <div className="mnum">8<small>h</small> 39<small>m</small></div>
                <p className="mlabel">a U.S. teen&rsquo;s daily screen time outside school — 43% of waking hours</p>
                <span className="msrc">Common Sense Media census</span>
              </div>
              <div className="mstat">
                <div className="mnum">237</div>
                <p className="mlabel">median notifications received per day by an adolescent</p>
                <span className="msrc">CSM · Univ. of Michigan, 2023</span>
              </div>
              <div className="mstat">
                <div className="mnum">110</div>
                <p className="mlabel">times a day the phone gets picked up and glanced at</p>
                <span className="msrc">device telemetry, 2023</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3 · Product */}
        {/* Metrics · willpower vs design (mms5377). Inside the PROBLEM block —
            it answers "just delete the apps" with the software-fix failure data.
            Same-unit bars only (long-term stick rate of software fixes). */}
        <section id="s-willpower" className="slide" style={tint(TINT.rodeo)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">Why willpower loses</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Software fixes don&rsquo;t stick.
            </p>
            <div className="mbars" role="img" aria-label="Long-term stick rates of software screen fixes: app blockers 17%, native screen-time tools 13%, grayscale mode 12%">
              <div className="mbar-row">
                <span className="mbar-name">App blockers</span>
                <div className="mbar-track"><div className="mbar-fill" style={{ width: "17%" }} /></div>
                <span className="mbar-val">17%</span>
              </div>
              <div className="mbar-row">
                <span className="mbar-name">Built-in screen-time tools</span>
                <div className="mbar-track"><div className="mbar-fill" style={{ width: "13%" }} /></div>
                <span className="mbar-val">13%</span>
              </div>
              <div className="mbar-row">
                <span className="mbar-name">Grayscale mode</span>
                <div className="mbar-track"><div className="mbar-fill" style={{ width: "12%" }} /></div>
                <span className="mbar-val">12%</span>
              </div>
            </div>
            <p className="mlabel" style={{ marginTop: "0.9rem" }}>
              share of users for whom each software fix works long-term
              <br />
              <span className="msrc">J. Medical Internet Research 2022 · grayscale adoption surveys</span>
            </p>
            <p className="mfoot">
              The restriction lives on the same screen as the temptation.
              <br />
              <b>Deletion is a decision you remake every day. A separate device is a decision you make once.</b>
            </p>
          </div>
        </section>

        {/* Solution · the mechanism (mms5377). AFTER the causal slide — schools
            proved environment change works; this is that change, productized.
            Mirrors the three problem stats one-for-one. Register: MANAGED. */}
        <section id="s-fix" className="slide" style={tint(TINT.tan)}>
          <div className="slide-body slide-body--metrics">
            <span className="kicker">The fix</span>
            <p className="line mline" style={{ fontSize: "clamp(1.8rem,5.4vw,4rem)" }}>
              Remove the vector. Keep the tool.
            </p>
            <div className="mrow">
              <div className="mstat">
                <div className="mnum">0</div>
                <p className="mlabel">feeds, stores, or engagement pings on the device — if it buzzes, it&rsquo;s a human</p>
                <span className="msrc">answers: 237 notifications/day</span>
              </div>
              <div className="mstat">
                <div className="mnum">10</div>
                <p className="mlabel">essential tools stay — banking, maps, 2FA, work chat. The phone still does its job</p>
                <span className="msrc">answers: the one-essential-app trap</span>
              </div>
              <div className="mstat">
                <div className="mnum">1&times;</div>
                <p className="mlabel">decision, made at the device level — nothing to bypass at 1am, nothing to re-decide</p>
                <span className="msrc">answers: 17% blocker stick rate</span>
              </div>
            </div>
            <p className="mfoot">
              Not an app fighting the phone. A <b>managed phone</b> — normal Android underneath,
              the feed simply isn&rsquo;t there.
            </p>
          </div>
        </section>

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


        {/* The marketing is me (knowledge#2562) — placed IMMEDIATELY BEFORE the
            fleet slide (s5). The order is the argument: here is the person →
            here is the machine that makes him able to ship. id="s-me" is
            non-numeric on purpose (see slides.ts) so it forces no renumbering
            and needs no edit to ReviewOverlay.tsx (mms5377 / knowledge#2542). */}
        <section id="s-me" className="slide" style={tint(TINT.tan)}>
          <div className="slide-body slide-body--me">
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
