import Link from "next/link";

export default function OverruleLanding() {
  return (
    <main>
      <h1>Your insurance denial, decoded. Your appeal, written.</h1>
      <p className="lede">
        Paste your denial letter. Every code on it gets translated into plain English from the
        real public code tables — instantly, with no AI in the loop. Then, if you want it, an
        appeal letter citing your exact denial codes, ready to print and mail. Free. No signup.
        Nothing you paste is stored.
      </p>

      <div className="ovr-btnrow">
        <Link href="/overrule/decode" className="ovr-cta">Decode my denial</Link>
        <Link href="/overrule/codes" className="ovr-cta secondary">Browse the code tables</Link>
      </div>

      <div className="ovr-stats">
        <div className="ovr-stat">
          <div className="n">19%</div>
          <div className="l">of in-network claims were denied by HealthCare.gov marketplace insurers in 2024</div>
          <div className="s">KFF analysis of CMS transparency data</div>
        </div>
        <div className="ovr-stat">
          <div className="n">&lt;1%</div>
          <div className="l">of denied claims are ever appealed by patients</div>
          <div className="s">KFF, 2024 plan year</div>
        </div>
        <div className="ovr-stat">
          <div className="n">80%+</div>
          <div className="l">of appealed denials get overturned in Medicare Advantage</div>
          <div className="s">KFF analysis of CMS data, 2023</div>
        </div>
      </div>

      <h2>How it works</h2>
      <div className="ovr-panel">
        <ul>
          <li><b>1 · Paste.</b> Your denial letter or Explanation of Benefits, or type the codes by hand.</li>
          <li><b>2 · Decode.</b> Each CARC/RARC denial code, CPT procedure, and ICD-10 diagnosis is looked up in public code tables — official meaning, plain-English translation, whether it&apos;s appealable, and your next step. This part runs entirely in your browser.</li>
          <li><b>3 · Appeal.</b> AI drafts the letter&apos;s body citing your specific codes into a formal appeal skeleton — every fact in it comes from the tables, and you edit before printing.</li>
        </ul>
      </div>

      <p className="ovr-small">
        The system counts on you not understanding the letter. Insurers already use AI to process
        and deny claims — this is AI on the patient&apos;s side of the table. Built at the DMV
        Hackathon, July 25, 2026.
      </p>
    </main>
  );
}
