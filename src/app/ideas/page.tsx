import type { Metadata } from "next";
import s from "./ideas.module.css";

/*
 * /ideas — RAW pitch-ideation surface (nova · knowledge#2523).
 * TWO competing 2-minute pitch angles for the DMV Hackathon judge, side by side.
 * Tyler picks the winner. The root "/" is the live submission deck — untouched.
 *
 * Thesis is Tyler's, verbatim in register: RAW is a CULTURE SHIFT, not
 * supercharged hardware. One device tries to be everything → generality rots
 * attention (a design failure, not a willpower failure). The future is plural,
 * focused devices. Phones are the wedge, not the destination.
 *
 * Two hard constraints honored throughout:
 *  1. "MANAGED", never "locked down" — a judge who swipes finds normal Android.
 *  2. raw.utopiamodels.ai is NOT linked or cited (currently serves a stale page).
 * RAW is a rebrand (a rip) today — never claimed as custom hardware.
 */

export const metadata: Metadata = {
  title: "RAW — two pitch angles · pick one",
  description:
    "Two competing 2-minute RAW pitch angles for the DMV Hackathon judge. Culture shift vs. live demo-flow. Tyler picks the winner.",
};

type Beat = { time: string; text: React.ReactNode; cue?: boolean };
type Angle = {
  key: string;
  label: string;
  title: string;
  register: string;
  hero: string;
  heroAlt: string;
  heroTag: string;
  script: Beat[];
  value: string;
  benefit: string;
  profit: React.ReactNode;
  weakQ: string;
  weakA: React.ReactNode;
};

const ANGLES: Angle[] = [
  {
    key: "A",
    label: "Angle A",
    title: "The World Is Yours",
    register: "The emotional, generational register — a culture shift, not a spec sheet.",
    hero: "/ideas/angle-a-hero.webp",
    heroAlt:
      "The RAW phone — a transparent-back Nothing device with its glyph interface glowing — floating over a warm amber desert horizon.",
    heroTag: "real · Nano Banana Pro · subject-locked to the RAW device",
    script: [
      {
        time: "00:00–00:20",
        text: "Everyone thinks they have a willpower problem. They don’t — they have a design problem. You pick up your phone to do one thing, and an hour later you’re somewhere you never chose to go. That’s not you failing. That’s a device built to be everything, doing exactly what it was designed to do.",
      },
      {
        time: "00:20–00:40",
        text: "One device tried to become your whole life — your work, your friends, your bank, your feed, your kids’ homework. And when one thing tries to be everything, it can’t be good at the things that actually matter. Attention is the price. We’ve all been paying it for fifteen years.",
      },
      {
        time: "00:40–01:00",
        text: "RAW is a bet that the future is plural. Not one glass rectangle that does everything — but focused devices, each with one mode of being. A phone for building. A phone for learning. A phone for being present. One device, one intention. The world stops happening to you, and starts being yours again.",
      },
      {
        time: "01:00–01:20",
        text: "This isn’t a productivity hack — it’s a culture shift. We want kids who actually learn instead of getting brain-rotted. We want builders who build. The message is simple: the world is yours, go make something. Building is cool again.",
      },
      {
        time: "01:20–01:40",
        text: "And I’m not projecting adoption — I am the adoption. Five days ago I took Chrome off my own phone. I carry a managed RAW phone to my engineering job every single day. The home screen shows ten apps — the ten that move my life forward. Everything else is gone. Not by willpower. By design.",
      },
      {
        time: "01:40–02:00",
        cue: true,
        text: (
          <>
            People ask: why not just delete the apps? Because deletion is a decision you remake every
            single morning — and you lose. A separate device is a decision you make{" "}
            <em className={s.stage}>once</em>. That’s the whole idea. RAW isn’t a phone company
            — it’s permission to choose your life on purpose. The world is yours.
          </>
        ),
      },
    ],
    value:
      "RAW turns a commodity Android into a focused, managed device with a brand and a philosophy. The durable asset is the rip system — the repeatable method for rebranding any phone into a curated, single-mode device.",
    benefit:
      "Your attention back by design, not willpower. A device that matches one intention instead of fighting for all of them. For parents: a phone their kids learn on, not rot on.",
    profit: (
      <>
        Sell the device <strong>plus</strong> the managed software layer; each mode — focus, learn,
        build — is its own <strong>curated app store</strong>, the recurring, durable revenue.
        Rebranding existing hardware keeps COGS low and margin in software. Wedge markets: parents,
        students, knowledge workers, and B2B managed work phones (Android Enterprise is already a
        multi-billion-dollar market).
      </>
    ),
    weakQ:
      "Isn’t this just self-restraint dressed up as a product — why would anyone pay for a phone that does less?",
    weakA: (
      <>
        Because deletion is a fight you remake daily and lose, and people <strong>already pay</strong>{" "}
        for the outcome — dumb phones, the Light Phone, screen-time coaches, parents managing kids’
        devices. RAW delivers that outcome without giving up the ten apps you actually need, and wraps it
        in a brand people want to belong to. The willingness-to-pay exists today; RAW gives it a name.
      </>
    ),
  },
  {
    key: "B",
    label: "Angle B",
    title: "Ten Apps, One Decision",
    register: "The demo-flow — how to walk the judge through the whole idea in two minutes, on a real phone.",
    hero: "/ideas/angle-b-hero.webp",
    heroAlt:
      "The RAW phone laid flat on a warm sand surface in bright daylight — a considered, minimal device that does less on purpose.",
    heroTag: "real · Nano Banana Pro · subject-locked to the RAW device",
    script: [
      {
        time: "00:00–00:20",
        cue: true,
        text: (
          <>
            Let me show you the whole idea in two minutes — on a real phone, in your hand.{" "}
            <em className={s.stage}>(hand the judge the phone)</em> This is my daily phone. Swipe up.
            Count the apps. Ten. Phone, Messages, Gmail, Drive, Claude, WhatsApp, Telegram — the ten
            that move my life forward. No Chrome. No app store. No feed to fall into.
          </>
        ),
      },
      {
        time: "00:20–00:40",
        cue: true,
        text: (
          <>
            Now — try to break it. Swipe around. It’s normal Android underneath: this is a{" "}
            <em className={s.stage}>managed</em> phone, not a locked box. Everything still works. I just
            decided, once, which ten things get to be on the home screen — and that decision holds
            every morning without me thinking about it.
          </>
        ),
      },
      {
        time: "00:40–01:00",
        text: "Here’s the thought that started it. The problem was never phones — it’s that one device tries to be everything, and generality rots attention. So instead of fighting the device with willpower, I changed the device. One phone, one mode. This one is for work and building.",
      },
      {
        time: "01:00–01:20",
        cue: true,
        text: (
          <>
            You’re already thinking it — why not just delete the apps? Watch: I could reinstall
            anything in thirty seconds. That’s exactly the point. Deletion is a decision you remake
            every single day, and you lose. This <em className={s.stage}>(hold up the phone)</em> is a
            decision I made once. A separate device beats a daily fight.
          </>
        ),
      },
      {
        time: "01:20–01:40",
        text: "Here’s why it’s a company, not a hobby. Today RAW is a rip — we rebrand an existing Android and lay a managed layer on top. Low cost to make, real margin in the software. Each mode — focus, learn, build — is its own curated app store. That’s the recurring revenue. Parents want a phone their kids learn on; companies already pay to manage work phones. We give them a brand and a philosophy instead of an IT tool.",
      },
      {
        time: "01:40–02:00",
        cue: true,
        text: (
          <>
            So the demo is the pitch. Not a slide — a phone that already exists, in my pocket, every
            day. RAW is the shift from a device that happens to you, to a device that’s yours. Ten
            apps. One decision. Made once. <em className={s.stage}>Want to hold it?</em>
          </>
        ),
      },
    ],
    value:
      "A live, working managed device — the device-owner app is compiled and running on a real phone today. Execution over mockup, and the rip system is the repeatable method behind it.",
    benefit:
      "The ten apps that matter, decided once. Normal Android underneath — managed, never caged: reinstall anything in seconds. Freedom by design, not restriction.",
    profit: (
      <>
        Rebranding an existing Android means <strong>low COGS</strong>; the margin lives in the managed
        software layer, and the per-mode curated stores are the recurring revenue. Two live markets:
        parents and students (B2C) and managed work phones (B2B) — sold as a brand and a belief, not
        an enterprise IT console.
      </>
    ),
    weakQ:
      "If it’s just normal Android with a managed launcher, what stops Google or Nothing from shipping this tomorrow — or a user doing it for free?",
    weakA: (
      <>
        Nothing stops a tinkerer from hacking their own — the same way nothing stops you from
        self-hosting email, and almost nobody does. The product is the curated, maintained, branded
        experience and the one-decision setup. And the platforms <strong>won’t</strong> build it:
        their whole business is maximizing engagement. A phone designed to be used <em>less</em> is
        anti-thetical to their model — which is precisely why a focused brand can own it.
      </>
    ),
  },
];

function AngleCard({ a }: { a: Angle }) {
  return (
    <article className={s.card}>
      <div className={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.hero} alt={a.heroAlt} />
        <span className={s.heroTag}>{a.heroTag}</span>
      </div>
      <div className={s.body}>
        <span className={s.angleLabel}>{a.label}</span>
        <h2 className={s.angleTitle}>{a.title}</h2>
        <p className={s.register}>{a.register}</p>

        <span className={s.sectionLabel}>The pitch — 2:00, word for word</span>
        <div className={s.script}>
          {a.script.map((b) => (
            <div key={b.time} className={`${s.beat}${b.cue ? ` ${s.cue}` : ""}`}>
              <span className={s.time}>{b.time}</span>
              <p className={s.spoken}>{b.text}</p>
            </div>
          ))}
        </div>

        <span className={s.sectionLabel}>Value · Benefit · Profit</span>
        <div className={s.vbp}>
          <div className={s.vbpRow}>
            <span className={s.vbpKey}>Value add</span>
            <p className={s.vbpVal}>{a.value}</p>
          </div>
          <div className={s.vbpRow}>
            <span className={s.vbpKey}>User benefit</span>
            <p className={s.vbpVal}>{a.benefit}</p>
          </div>
          <div className={s.vbpRow}>
            <span className={s.vbpKey}>Profitability</span>
            <p className={s.vbpVal}>{a.profit}</p>
          </div>
        </div>

        <span className={s.sectionLabel}>Weakest question — and the honest answer</span>
        <div className={s.weak}>
          <p className={s.weakQ}>{a.weakQ}</p>
          <p className={s.weakA}>{a.weakA}</p>
        </div>
      </div>
    </article>
  );
}

export default function Ideas() {
  return (
    <div className={s.page}>
      <header className={s.masthead}>
        <span className={s.kicker}>RAW · pitch ideation · DMV Hackathon</span>
        <h1 className={s.title}>Two angles. You pick.</h1>
        <p className={s.subtitle}>
          A 2-minute shark-tank pitch to one judge. Each angle carries the same thesis —{" "}
          <strong>RAW is a culture shift, not supercharged hardware</strong> — in a different
          register. Full spoken script, a real generated visual, and the honest weak spot for each.
        </p>
      </header>

      <div className={s.grid}>
        {ANGLES.map((a) => (
          <AngleCard key={a.key} a={a} />
        ))}
      </div>

      <section className={s.ground}>
        <div className={s.groundGrid}>
          <div className={s.groundCol}>
            <h3>The proof already exists — the credibility spine</h3>
            <ul>
              <li>
                A <strong>device-owner Android app</strong> runs on a real Pixel today — a launcher
                showing <strong>ten allowlisted apps</strong>: Phone, Messages, Gmail, Drive, Claude,
                WhatsApp, Telegram, Tailscale, Termux, GitHub. No Chrome. No store. Verified compiled.
              </li>
              <li>
                Tyler removed Chrome from his own phone five days ago and carries the managed RAW phone to
                his engineering job daily. <strong>He is not projecting adoption — he is the adoption.</strong>
              </li>
              <li>
                RAW is a <strong>rebrand today</strong> (a rip of the Nothing phone) — own the rip out
                loud; it is the method, not a shortcut. No custom hardware is claimed.
              </li>
            </ul>
          </div>
          <div className={s.groundCol}>
            <h3>Two hard constraints — do not violate on stage</h3>
            <ul>
              <li>
                <span className={s.pill}>SAY THIS</span> &ldquo;managed&rdquo; — a managed work phone,
                not a kiosk. A judge who swipes finds normal Android underneath.{" "}
                <strong>&ldquo;The launcher shows ten apps&rdquo; is true and checkable on the spot.</strong>
              </li>
              <li>
                <span className={`${s.pill} ${s.dangerPill}`}>NEVER</span> say &ldquo;locked down&rdquo;
                — it is false and checkable, and it loses the pitch.
              </li>
              <li>
                <span className={`${s.pill} ${s.dangerPill}`}>DO NOT LINK</span> raw.utopiamodels.ai —
                it currently serves a stale page; never cite it as traction or let a judge click it.
              </li>
            </ul>
          </div>
        </div>
        <p className={s.foot}>
          ideation surface — the live submission deck is the root <a href="/">/</a> (untouched) ·
          nova · knowledge#2523
        </p>
      </section>
    </div>
  );
}
