"use client";

/*
 * /ideas — RAW pitch ideation surface (DMV Hackathon Track 04).
 *
 * Competing 2-minute shark-tank angles for Tyler to pick the winner. Each:
 * title · full word-for-word spoken script with timing markers ·
 * value-add / user-benefit / profitability · a REAL generated visual ·
 * the one judge question it is weakest against + the honest answer.
 *
 * This is a SHARED board — masters ADD their angles, never clobber another's.
 * Angles A–D by prior masters (cloud + win); angles E–F added by nova (#2523).
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

  // ── win · Angle C — the generational bet ─────────────────────────────────
  {
    key: "C",
    tint: "rgba(156,128,92,0.34)",
    eyebrow: "Angle C · win · the generational bet",
    title: "The World Is Yours",
    premise:
      "The generational angle — hardware for productivity, growth, and a new life. We want kids to actually learn, not just be brain-rotted.",
    image: "/ideas/angleA-hero.webp",
    imageAlt:
      "The RAW phone standing in a warm desert dawn, the sun rising behind its transparent glyph back — hardware for a new life.",
    caption:
      "Hardware for a new life — one focused device in a warm dawn. Generated from the real Glyph hero.",
    script: [
      {
        t: "[00:00–00:15]",
        text:
          "Hand a kid a phone today and you've handed them everything at once — every game, every feed, every notification — and told them to focus. That's not a willpower problem. That's a design problem.",
      },
      {
        t: "[00:15–00:35]",
        text:
          "One device tries to be everything, and being everything is what rots attention. We think the future isn't one phone that does it all. It's plural, focused devices — one device, one mode of being, each with its own curated store.",
      },
      {
        t: "[00:35–00:55]",
        text:
          "This is RAW. It's a managed phone — not locked down, managed. Pick it up and it's normal Android underneath. But the launcher shows ten apps: the tools you build a life with, and nothing designed to steal an hour. It's a decision about attention, made once, in hardware.",
      },
      {
        t: "[00:55–01:20]",
        text:
          "Here's why you should believe me: this already runs. There's a device-owner app on my own Pixel right now — the launcher, the ten apps, no Chrome, no store. I removed the browser from my phone five days ago and I carry it to my engineering job every day. I'm not projecting adoption. I'm employee number one.",
      },
      {
        t: "[01:20–01:40]",
        text:
          "The value is focus you don't have to fight for. The benefit — for a student, for a kid, for anyone trying to grow — is a device built for productivity and learning instead of one built to keep you scrolling. We want kids to actually learn, not just be brain-rotted.",
      },
      {
        t: "[01:40–02:00]",
        text:
          "And it's a business: we don't make the hardware, we rip and rebrand a premium phone — so hardware margin, plus a curated app store, plus managed-device subscriptions for schools and families. Deletion is a decision you remake every single day. A separate device is a decision you make once. The world is yours — we just want to hand kids a device worthy of it.",
      },
    ],
    vbp: {
      value:
        "Focus you don't have to fight for — attention moved out of settings and into hardware, a decision made once instead of a battle lost every day.",
      benefit:
        "For a student or a kid: a device built for productivity and learning instead of one built to keep them scrolling. Kids who actually learn, not brain-rotted.",
      profit:
        "No manufacturing — rip and rebrand a premium phone: hardware margin per unit + a curated app-store cut + managed-device subscriptions sold to schools and families.",
    },
    weakest: {
      q: "Why buy a second phone when a parent can just set screen-time limits on the one they already own?",
      a: "Because those limits live on the device that's fighting you, and they get switched off the first moment they're inconvenient — deletion and limits are a decision remade every single day. A separate device moves that decision into hardware, made once. And it isn't only parents — it's the builder who keeps losing the hour and would pay to get it back.",
    },
  },

  // ── win · Angle D — demo-flow: value → benefit → profit in three beats ───
  {
    key: "D",
    tint: "rgba(196,170,130,0.28)",
    eyebrow: "Angle D · win · value → benefit → profit",
    title: "One Device, One Mode",
    premise:
      "Demo-flow — walk the judge through value, then benefit, then profitability in three tight beats, phone in hand.",
    image: "/ideas/angleB-hero.webp",
    imageAlt:
      "The RAW phone as a warm studio product hero, its glyph dot-matrix glowing on a desert-rodeo ground.",
    caption:
      "The product, three beats: value, benefit, profit. Generated from the real glyph product shot.",
    script: [
      {
        t: "[00:00–00:20]",
        text:
          "I'm going to walk you through RAW in three beats: what it's worth, who it helps, and how it makes money. Watch the phone in my hand while I do it. Beat one — the value.",
      },
      {
        t: "[00:20–00:50]",
        text:
          "Your phone is the only tool you own that's designed to work against you. One device tries to be everything, and everything is exactly what breaks your focus. RAW is a managed phone — normal Android underneath, but the launcher shows ten curated apps and no infinite feeds. The value is simple: attention, back in hardware. A decision you make once instead of a battle you lose every day.",
      },
      {
        t: "[00:50–01:20]",
        text:
          "Beat two — who benefits. Start with the people already asking for this: students, parents, builders, anyone trying to grow instead of scroll. And this isn't a concept. A device-owner app runs on my Pixel today: the launcher, ten apps, no Chrome, no store. I took the browser off my own phone five days ago and carry it to work daily. The benefit is proven on the toughest user I have — me.",
      },
      {
        t: "[01:20–01:50]",
        text:
          "Beat three — the money. We don't manufacture anything; we rip and rebrand a premium phone that already exists. So three revenue lines stack: hardware margin on every unit, a curated app store that takes a cut of what's allowed on, and managed-device subscriptions we sell to schools and families who want this by the classroom. Low build cost, three ways to earn.",
      },
      {
        t: "[01:50–02:00]",
        text:
          "Value: focus in hardware. Benefit: proven on real users. Profit: rebrand margin, a store, and subscriptions. One device, one mode. That's RAW.",
      },
    ],
    vbp: {
      value:
        "Attention, back in hardware — the one tool designed to work against you replaced by a managed phone whose launcher shows ten curated apps and no infinite feeds.",
      benefit:
        "Proven on real users already asking for it — students, parents, builders. Not a concept: the device-owner app runs on a real Pixel today, tested on the toughest user there is.",
      profit:
        "Zero manufacturing — rebrand a phone that already exists. Three stacked lines: hardware margin, a curated app-store cut, and managed-device subscriptions sold by the classroom.",
    },
    weakest: {
      q: "You're reselling someone else's phone — what stops Nothing, or Apple, from shipping a focus mode and killing you overnight?",
      a: "A focus mode is a setting on the everything-device — it's the delete-the-apps problem again: remade every day and defaulted off. Our moat was never the silicon. It's the rip-and-rebrand method, the curated store, and the managed layer — the culture and the catalog, not the hardware. We own the rip out loud: it's the method, not a shortcut.",
    },
  },

  // ── nova · Angle E — the culture shift (emotional / generational) ─────────
  {
    key: "E",
    tint: "rgba(41,30,22,0.6)",
    eyebrow: "Angle E · nova · the culture shift",
    title: "A Decision You Make Once",
    premise:
      "The emotional, generational register — a culture shift, not a spec sheet. Generality rots attention; the fix is a device you choose once, not a willpower battle you re-fight every morning.",
    image: "/ideas/angle-a-hero.webp",
    imageAlt:
      "The RAW phone — a transparent-back device with its glyph interface glowing — floating over a warm amber desert horizon.",
    caption:
      "The phone over a warm amber horizon, the glyph glowing. Generated (Nano Banana Pro), subject-locked to the real transparent-back device.",
    script: [
      {
        t: "[00:00–00:20]",
        text:
          "Everyone thinks they have a willpower problem. They don't — they have a design problem. You pick up your phone to do one thing, and an hour later you're somewhere you never chose to go. That's not you failing. That's a device built to be everything, doing exactly what it was designed to do.",
      },
      {
        t: "[00:20–00:40]",
        text:
          "One device tried to become your whole life — your work, your friends, your bank, your feed, your kids' homework. And when one thing tries to be everything, it can't be good at the things that actually matter. Attention is the price. We've all been paying it for fifteen years.",
      },
      {
        t: "[00:40–01:00]",
        text:
          "RAW is a bet that the future is plural. Not one glass rectangle that does everything — but focused devices, each with one mode of being. A phone for building. A phone for learning. A phone for being present. One device, one intention. The world stops happening to you, and starts being yours again.",
      },
      {
        t: "[01:00–01:20]",
        text:
          "This isn't a productivity hack — it's a culture shift. We want kids who actually learn instead of getting brain-rotted. We want builders who build. The message is simple: the world is yours, go make something. Building is cool again.",
      },
      {
        t: "[01:20–01:40]",
        text:
          "And I'm not projecting adoption — I am the adoption. Five days ago I took Chrome off my own phone. I carry a managed RAW phone to my engineering job every single day. The home screen shows ten apps — the ten that move my life forward. Everything else is gone. Not by willpower. By design.",
      },
      {
        t: "[01:40–02:00]",
        text:
          "People ask: why not just delete the apps? Because deletion is a decision you remake every single morning — and you lose. A separate device is a decision you make once. That's the whole idea. RAW isn't a phone company — it's permission to choose your life on purpose. The world is yours.",
      },
    ],
    vbp: {
      value:
        "RAW turns a commodity Android into a focused, managed device with a brand and a philosophy. The durable asset is the rip system — the repeatable method for rebranding any phone into a curated, single-mode device.",
      benefit:
        "Your attention back by design, not willpower. A device that matches one intention instead of fighting for all of them. For parents: a phone their kids learn on, not rot on.",
      profit:
        "Sell the device plus the managed software layer; each mode — focus, learn, build — is its own curated app store, the recurring, durable revenue. Rebranding existing hardware keeps COGS low and margin in software. Wedge markets: parents, students, knowledge workers, and B2B managed work phones (Android Enterprise is already a multi-billion-dollar market).",
    },
    weakest: {
      q: "Isn't this just self-restraint dressed up as a product — why would anyone pay for a phone that does less?",
      a: "Because deletion is a fight you remake daily and lose, and people already pay for the outcome — dumb phones, the Light Phone, screen-time coaches, parents managing kids' devices. RAW delivers that outcome without giving up the ten apps you actually need, and wraps it in a brand people want to belong to. The willingness-to-pay exists today; RAW gives it a name.",
    },
  },

  // ── nova · Angle F — the two-minute walkthrough (demo-flow) ───────────────
  {
    key: "F",
    tint: "rgba(74,54,38,0.5)",
    eyebrow: "Angle F · nova · the two-minute walkthrough",
    title: "Ten Apps, One Decision",
    premise:
      "Demo-flow — how to walk the judge through the whole idea in two minutes, on a real phone: count the ten apps, try to break it, handle the counter live, then the business.",
    image: "/ideas/angle-b-hero.webp",
    imageAlt:
      "The RAW phone laid flat on a warm sand surface in bright daylight — a considered, minimal device that does less on purpose.",
    caption:
      "The phone as a considered object in bright daylight — does less, on purpose. Generated (Nano Banana Pro), subject-locked to the real device.",
    script: [
      {
        t: "[00:00–00:20]",
        text:
          "Let me show you the whole idea in two minutes — on a real phone, in your hand. (hand the judge the phone) This is my daily phone. Swipe up. Count the apps. Ten. Phone, Messages, Gmail, Drive, Claude, WhatsApp, Telegram — the ten that move my life forward. No Chrome. No app store. No feed to fall into.",
      },
      {
        t: "[00:20–00:40]",
        text:
          "Now — try to break it. Swipe around. It's normal Android underneath: this is a managed phone, not a locked box. Everything still works. I just decided, once, which ten things get to be on the home screen — and that decision holds every morning without me thinking about it.",
      },
      {
        t: "[00:40–01:00]",
        text:
          "Here's the thought that started it. The problem was never phones — it's that one device tries to be everything, and generality rots attention. So instead of fighting the device with willpower, I changed the device. One phone, one mode. This one is for work and building.",
      },
      {
        t: "[01:00–01:20]",
        text:
          "You're already thinking it — why not just delete the apps? Watch: I could reinstall anything in thirty seconds. That's exactly the point. Deletion is a decision you remake every single day, and you lose. This (hold up the phone) is a decision I made once. A separate device beats a daily fight.",
      },
      {
        t: "[01:20–01:40]",
        text:
          "Here's why it's a company, not a hobby. Today RAW is a rip — we rebrand an existing Android and lay a managed layer on top. Low cost to make, real margin in the software. Each mode — focus, learn, build — is its own curated app store. That's the recurring revenue. Parents want a phone their kids learn on; companies already pay to manage work phones. We give them a brand and a philosophy instead of an IT tool.",
      },
      {
        t: "[01:40–02:00]",
        text:
          "So the demo is the pitch. Not a slide — a phone that already exists, in my pocket, every day. RAW is the shift from a device that happens to you, to a device that's yours. Ten apps. One decision. Made once. Want to hold it?",
      },
    ],
    vbp: {
      value:
        "A live, working managed device — the device-owner app is compiled and running on a real phone today. Execution over mockup, and the rip system is the repeatable method behind it.",
      benefit:
        "The ten apps that matter, decided once. Normal Android underneath — managed, never caged: reinstall anything in seconds. Freedom by design, not restriction.",
      profit:
        "Rebranding an existing Android means low COGS; the margin lives in the managed software layer, and the per-mode curated stores are the recurring revenue. Two live markets: parents and students (B2C) and managed work phones (B2B) — sold as a brand and a belief, not an enterprise IT console.",
    },
    weakest: {
      q: "If it's just normal Android with a managed launcher, what stops Google or Nothing from shipping this tomorrow — or a user doing it for free?",
      a: "Nothing stops a tinkerer from hacking their own — the same way nothing stops you from self-hosting email, and almost nobody does. The product is the curated, maintained, branded experience and the one-decision setup. And the platforms won't build it: their whole business is maximizing engagement. A phone designed to be used less is anti-thetical to their model — which is precisely why a focused brand can own it.",
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
        <h1 className="ideas-title">Pick the winner.</h1>
        <p className="ideas-sub">
          Competing 2-minute shark-tank pitches for one judge. Same thesis — RAW is a
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
