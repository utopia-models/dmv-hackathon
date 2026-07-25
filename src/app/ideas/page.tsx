"use client";

/*
 * /ideas — RAW pitch ideation surface (DMV Hackathon Track 04).
 *
 * TWO competing 2-minute shark-tank angles for Tyler to pick the winner.
 * Each: title · full word-for-word spoken script with timing markers ·
 * value-add / user-benefit / profitability · a REAL generated visual ·
 * the one judge question it is weakest against + the honest answer.
 *
 * This is the IDEATION surface — NOT the live submission. The root `/`
 * is the submission deck and is untouched by this route.
 *
 * Rendered CLIENT-SIDE ONLY (gated on `mounted`) so the content mounts in
 * the browser after hydration — a `curl | grep` of the HTML will not see it;
 * verify in a real browser.
 */

import { useEffect, useState, type CSSProperties } from "react";

type Beat = { t: string; text: string };
type VBP = { value: string; benefit: string; profit: string };
type Angle = {
  key: string;
  tint: string;
  eyebrow: string;
  title: string;
  premise: string;
  image: string;
  imageAlt: string;
  caption: string;
  script: Beat[];
  vbp: VBP;
  weakest: { q: string; a: string };
};

const ANGLES: Angle[] = [
  {
    key: "A",
    tint: "rgba(74,54,38,0.55)",
    eyebrow: "Angle A · 2:00 · one judge",
    title: "Founder Is User #1",
    premise:
      "RAW Engineering v1 as the concrete wedge — the managed launcher that already runs, with the founder as adopter number one.",
    image: "/ideas/angleA-launcher.webp",
    imageAlt:
      "A white minimalist RAW phone standing upright, screen on, showing a calm dark home launcher of ten monochrome line-art app icons — no browser, no store.",
    caption:
      "The RAW managed launcher — ten allowlisted apps, no browser, no store. Running on a real device today.",
    script: [
      {
        t: "[00:00–00:20]",
        text:
          "Your phone is failing you, and it is not your fault. One device is trying to be everything — your work, your feed, your bank, your dopamine. When one thing does everything, it does nothing well. That is not a willpower problem. It is a design failure.",
      },
      {
        t: "[00:20–00:45]",
        text:
          "People say: just delete the apps. But deletion is a decision you remake every single day. Willpower is a tax you pay every morning. RAW takes that decision off your shoulders — because a separate device is a decision you make once.",
      },
      {
        t: "[00:45–01:15]",
        text:
          "RAW is a managed work phone. Not locked down — managed. Swipe, and normal Android is still underneath; nothing is taken from you. But the launcher shows ten apps: phone, messages, mail, drive, the tools you actually build with. No browser. No store. And this is not a slide — it runs on my phone right now. I pulled Chrome off my own device five days ago and I carry this to my engineering job every day. I am not projecting adoption. I am user number one.",
      },
      {
        t: "[01:15–01:40]",
        text:
          "The value: we sell focus as a product, on hardware people already trust — we rip a great phone and repurpose it, in the open. The benefit: your attention comes back, and for families, kids who actually learn instead of getting brain-rotted. The profit: hardware plus a curated app store per device — we take a cut of a focused ecosystem, not an ad model that fights the user.",
      },
      {
        t: "[01:40–02:00]",
        text:
          "Phones are the wedge, not the destination. The future is not one device that rots your attention — it is plural, focused devices, each with one mode of being. Building is cool again. The world is yours. This is RAW.",
      },
    ],
    vbp: {
      value:
        "Focus sold as a product on hardware people already trust — a great phone ripped and repurposed, in the open. Software-only, no factory.",
      benefit:
        "Attention returned to the owner; for families, kids who learn instead of getting brain-rotted. One decision made once, not remade every morning.",
      profit:
        "Hardware margin plus a per-device curated app store — a cut of a focused ecosystem that is on the user's side, not an ad engine against them.",
    },
    weakest: {
      q: "It's a custom launcher on an existing Android phone — what stops Apple or Google from copying it tomorrow?",
      a: "Nothing stops the launcher; that's the easy part. But big platforms earn from your attention, so they structurally can't ship a device designed to reduce screen time — it fights their own ad revenue. We can, because focus IS our product. And the rip-and-repurpose method plus a per-device curated store compounds into a catalog and a brand a launcher clone doesn't have.",
    },
  },
  {
    key: "B",
    tint: "rgba(107,82,54,0.5)",
    eyebrow: "Angle B · 2:00 · one judge",
    title: "Watch It Run",
    premise:
      "Demo-flow — the live surfaces and the running device as proof RAW is real today, not a mockup made last night.",
    image: "/ideas/angleB-inhand.webp",
    imageAlt:
      "A hand holds a white glyph-back RAW phone at an engineering desk, screen showing the dark managed launcher, a live operations dashboard glowing on the monitor behind.",
    caption:
      "The running device in hand, the live operations center behind it — proof it runs today.",
    script: [
      {
        t: "[00:00–00:15]",
        text:
          "I am going to stop pitching and show you. This is a phone in my hand right now. Watch the screen.",
      },
      {
        t: "[00:15–00:40]",
        text:
          "This is RAW. The home screen has ten apps — phone, messages, mail, drive, the things I build with. There is no browser. There is no app store to pull me back in. It is a managed work phone: watch — I swipe, and normal Android is still under here. Nothing is taken away from me. The distraction is just not the default anymore.",
      },
      {
        t: "[00:40–01:05]",
        text:
          "How is it built? A founder and an AI fleet, in the open. This screen is our live operations center, running right now at utopiamodels dot ai — real agents shipping real code that you can watch. RAW is not a mockup we made last night. It is a system that runs today, and I have carried this exact phone to my engineering job every day this week.",
      },
      {
        t: "[01:05–01:35]",
        text:
          "Here is why it matters to you as a judge. Value add: we take a phone people already love and repurpose it into a focus device — no factory, all software, shipping now. User benefit: attention back for adults, and kids who learn instead of getting brain-rotted. Profitability: hardware margin plus a curated app store on every focused device — a cut of an ecosystem that is on the user's side, not an ad engine against them.",
      },
      {
        t: "[01:35–02:00]",
        text:
          "The counter is always: why not just delete the apps? Because deletion is a decision you remake every day. A separate device is a decision you make once. The future is plural, focused devices — one device, one mode of being. It already runs. The world is yours. This is RAW.",
      },
    ],
    vbp: {
      value:
        "A phone people already love, repurposed into a focus device — demonstrated live, no factory, all software, shipping now.",
      benefit:
        "Attention back for adults and a device where kids learn instead of getting brain-rotted — shown, not asserted, on a device the founder carries daily.",
      profit:
        "Hardware margin plus a curated app store on every focused device — a recurring cut of an ecosystem aligned with the user, not against them.",
    },
    weakest: {
      q: "This is a launcher and a dashboard demo — where's the real traction, users, revenue?",
      a: "Today it's one committed user — me — carrying it daily, and a running system you can watch, not a slide deck. That's honest: RAW is pre-revenue. But 'founder is user #1, every day, in public' beats a vanity waitlist, and the software-only path means the next person can hold this within the week, not after a hardware cycle.",
    },
  },
];

function ScriptBlock({ script }: { script: Beat[] }) {
  return (
    <ol className="script">
      {script.map((b) => (
        <li key={b.t}>
          <span className="t">{b.t}</span>
          <span className="say">{b.text}</span>
        </li>
      ))}
    </ol>
  );
}

function AngleCard({ a }: { a: Angle }) {
  return (
    <article className="angle" style={{ "--tint": a.tint } as CSSProperties}>
      <figure className="shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.image} alt={a.imageAlt} loading="lazy" draggable={false} />
        <figcaption>{a.caption}</figcaption>
      </figure>

      <div className="body">
        <span className="eyebrow">{a.eyebrow}</span>
        <h2 className="atitle">{a.title}</h2>
        <p className="premise">{a.premise}</p>

        <span className="lbl">The pitch — word for word</span>
        <ScriptBlock script={a.script} />

        <div className="vbp">
          <div>
            <span className="vbp-k">Value add</span>
            <p>{a.vbp.value}</p>
          </div>
          <div>
            <span className="vbp-k">User benefit</span>
            <p>{a.vbp.benefit}</p>
          </div>
          <div>
            <span className="vbp-k">Profitability</span>
            <p>{a.vbp.profit}</p>
          </div>
        </div>

        <div className="weakest">
          <span className="lbl">Weakest against</span>
          <p className="wq">&ldquo;{a.weakest.q}&rdquo;</p>
          <p className="wa">
            <span className="wa-k">Honest answer</span> {a.weakest.a}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Ideas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <main className="ideas">
      <header className="ideas-head">
        <span className="ideas-eyebrow">RAW · pitch ideation</span>
        <h1 className="ideas-title">Two angles. Pick the winner.</h1>
        <p className="ideas-sub">
          Two competing 2-minute shark-tank pitches for one judge. Same thesis — RAW is a
          culture shift, not supercharged hardware; the future is plural, focused devices.
          The proof already exists: a managed launcher runs on a real phone today, and the
          founder is user&nbsp;#1.
        </p>
        <p className="ideas-note">
          Ideation surface — the live submission is the root deck, untouched by this page.
        </p>
      </header>

      <div className="angles">
        {ANGLES.map((a) => (
          <AngleCard key={a.key} a={a} />
        ))}
      </div>

      <footer className="ideas-foot">
        <p>
          Say &ldquo;managed,&rdquo; never &ldquo;locked down.&rdquo; Own the rip out loud —
          it is the method, not the shortcut. Never claim custom hardware.
        </p>
      </footer>
    </main>
  );
}
