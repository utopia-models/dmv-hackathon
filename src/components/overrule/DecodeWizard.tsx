"use client";

import { useMemo, useRef, useState } from "react";
import type { AppealLetter, Explanation, ExtractedClaim } from "@/lib/overrule-types";
import { extractClaim } from "@/lib/extract";
import { lookupDenialCode, ALL_DENIAL_CODES } from "@/data/carc-rarc";
import { SAMPLE_DENIALS } from "@/data/sample-denials";
import { renderLetterText } from "@/lib/letter-template";
import ReadAloud from "./ReadAloud";

type Icd10Info = Record<string, string>; // code -> description

export default function DecodeWizard() {
  const [text, setText] = useState("");
  const [claim, setClaim] = useState<ExtractedClaim | null>(null);
  const [manualQuery, setManualQuery] = useState("");
  const [icd10Info, setIcd10Info] = useState<Icd10Info>({});
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [explaining, setExplaining] = useState(false);
  const [letter, setLetter] = useState<AppealLetter | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [patient, setPatient] = useState({ patientName: "", claimNumber: "", dateOfService: "", payer: "" });
  const letterRef = useRef<HTMLDivElement>(null);

  const decode = (input: string) => {
    const c = extractClaim(input);
    setClaim(c);
    setExplanation(null);
    setLetter(null);
    setPatient((p) => ({ ...p, payer: c.payer ?? p.payer }));
    // Look up ICD-10 descriptions (batched, deterministic server table)
    c.icd10s.forEach(async (code) => {
      try {
        const r = await fetch(`/api/icd10?q=${encodeURIComponent(code)}`);
        const { results } = await r.json();
        const hit = results?.find((e: { code: string }) => e.code === code) ?? results?.[0];
        if (hit) setIcd10Info((prev) => ({ ...prev, [code]: hit.description }));
      } catch {
        /* reference lookup is best-effort; cards render without it */
      }
    });
  };

  const manualMatches = useMemo(() => {
    const q = manualQuery.trim().toUpperCase();
    if (q.length < 1) return [];
    return ALL_DENIAL_CODES.filter(
      (e) =>
        `${e.type === "CARC" ? e.group + "-" : ""}${e.code}`.includes(q) ||
        e.meaning.toUpperCase().includes(q)
    ).slice(0, 6);
  }, [manualQuery]);

  const addManualCode = (display: string) => {
    if (!claim) {
      setClaim({ codes: [display], cpts: [], icd10s: [], amounts: {}, rawText: "" });
    } else if (!claim.codes.includes(display)) {
      setClaim({ ...claim, codes: [...claim.codes, display] });
    }
    setManualQuery("");
    setExplanation(null);
    setLetter(null);
  };

  const explain = async () => {
    if (!claim) return;
    setExplaining(true);
    try {
      const r = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim }),
      });
      const data = await r.json();
      setExplanation(data.explanation);
    } catch {
      // Client-side last resort: table-derived verdicts
      const yes = claim.codes.some((c) => lookupDenialCode(c)?.appealable === "yes");
      setExplanation({
        summary:
          "We couldn't reach the explanation service, but the code cards above tell the story — check each next step.",
        appealStrength: yes ? "strong" : "moderate",
        reasons: claim.codes
          .map((c) => lookupDenialCode(c))
          .filter(Boolean)
          .map((e) => `${e!.code}: ${e!.nextAction}`),
      });
    } finally {
      setExplaining(false);
    }
  };

  const draftLetter = async () => {
    if (!claim) return;
    setDrafting(true);
    try {
      const r = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, explanation, patient }),
      });
      const data = await r.json();
      setLetter({ ...data.letter, ...stripEmpty(patient) });
    } catch {
      const { buildFallbackParagraphs } = await import("@/lib/letter-template");
      setLetter({
        patientName: patient.patientName,
        payer: patient.payer || claim.payer || "",
        claimNumber: patient.claimNumber,
        dateOfService: patient.dateOfService,
        bodyParagraphs: buildFallbackParagraphs(claim),
      });
    } finally {
      setDrafting(false);
    }
  };

  const strengthPct = explanation
    ? { strong: 88, moderate: 55, weak: 25 }[explanation.appealStrength]
    : 0;

  return (
    <main>
      <h1>Decode your denial</h1>
      <p className="lede">
        Paste the full text of your denial letter or EOB. Decoding happens in your browser from
        public code tables — nothing is stored, and no AI touches this step.
      </p>

      <div className="ovr-samples ovr-noprint">
        {SAMPLE_DENIALS.map((s) => (
          <button key={s.id} className="ovr-sample" onClick={() => { setText(s.text); decode(s.text); }}>
            <span className="t">{s.title}</span>
            <span className="b">{s.blurb}</span>
          </button>
        ))}
      </div>

      <textarea
        className="ovr-noprint"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your denial letter or Explanation of Benefits here…"
        aria-label="Denial letter text"
      />
      <div className="ovr-btnrow ovr-noprint">
        <button className="ovr-cta" onClick={() => decode(text)} disabled={!text.trim()}>
          Decode
        </button>
      </div>

      {claim && (
        <>
          {claim.codes.length === 0 && (
            <div className="ovr-panel">
              <b>No standard denial codes detected.</b>
              <p className="ovr-small">
                Look for codes like <code>CO-45</code>, <code>PR-204</code>, or <code>N115</code>{" "}
                on your letter and add them below — the decoder takes it from there.
              </p>
            </div>
          )}

          <div className="ovr-noprint" style={{ position: "relative", maxWidth: "28rem" }}>
            <input
              type="text"
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Add a code from your letter (e.g. CO-50, N115)…"
              aria-label="Add a denial code manually"
            />
            {manualMatches.length > 0 && (
              <div className="ovr-panel" style={{ position: "absolute", zIndex: 10, width: "100%", marginTop: 4 }}>
                {manualMatches.map((e) => {
                  const display = e.type === "CARC" ? `${e.group}-${e.code}` : e.code;
                  return (
                    <button key={display} className="ovr-sample" style={{ display: "block", width: "100%", marginBottom: 4 }}
                      onClick={() => addManualCode(display)}>
                      <span className="t">{display}</span> <span className="b">{e.meaning}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {claim.codes.length > 0 && (
            <>
              <h2>What your denial codes mean</h2>
              <div className="ovr-cards">
                {claim.codes.map((code) => {
                  const e = lookupDenialCode(code);
                  if (!e)
                    return (
                      <div className="ovr-card" key={code}>
                        <span className="code">{code}</span>
                        <span className="meaning">Not in our table yet — check the code list on the back of your EOB.</span>
                      </div>
                    );
                  return (
                    <div className="ovr-card" key={code}>
                      <span className="code">{code}</span>
                      <span className={`ovr-badge ${e.appealable}`}>
                        {e.appealable === "yes" ? "Appealable" : e.appealable === "sometimes" ? "Sometimes appealable" : "Not typically appealable"}
                      </span>
                      <span className="meaning">{e.meaning}</span>
                      <span className="plain">{e.plainEnglish}</span>
                      <span className="action"><b>Next step:</b> {e.nextAction}</span>
                    </div>
                  );
                })}
                {claim.icd10s.map((code) => (
                  <div className="ovr-card" key={code}>
                    <span className="code">{code}</span>
                    <span className="ovr-badge no">Diagnosis</span>
                    <span className="plain">{icd10Info[code] ?? "Looking up in the ICD-10-CM 2026 table…"}</span>
                  </div>
                ))}
              </div>

              <div className="ovr-btnrow ovr-noprint">
                <button className="ovr-cta" onClick={explain} disabled={explaining}>
                  {explaining ? "Thinking" : "Explain my situation"}
                </button>
              </div>
            </>
          )}

          {explaining && <p className="ovr-spin">Reading your codes against the tables</p>}

          {explanation && (
            <div className="ovr-panel">
              <div className="ovr-strength" aria-label={`Appeal strength: ${explanation.appealStrength}`}>
                <span className="word">{explanation.appealStrength}</span>
                <div className="bar"><div className="fill" style={{ width: `${strengthPct}%` }} /></div>
              </div>
              <p>{explanation.summary}</p>
              <ul>
                {explanation.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
              <div className="ovr-btnrow ovr-noprint">
                <ReadAloud text={`${explanation.summary} ${explanation.reasons.join(". ")}`} />
                <button className="ovr-cta" onClick={draftLetter} disabled={drafting}>
                  {drafting ? "Drafting" : "Generate my appeal letter"}
                </button>
              </div>
            </div>
          )}

          {drafting && <p className="ovr-spin">Writing your appeal</p>}

          {letter && (
            <>
              <h2>Your appeal letter</h2>
              <div className="ovr-btnrow ovr-noprint">
                <input type="text" style={{ maxWidth: "12rem" }} placeholder="Your name" value={patient.patientName}
                  onChange={(e) => setPatient({ ...patient, patientName: e.target.value })} aria-label="Your name" />
                <input type="text" style={{ maxWidth: "12rem" }} placeholder="Claim number" value={patient.claimNumber}
                  onChange={(e) => setPatient({ ...patient, claimNumber: e.target.value })} aria-label="Claim number" />
                <input type="text" style={{ maxWidth: "10rem" }} placeholder="Date of service" value={patient.dateOfService}
                  onChange={(e) => setPatient({ ...patient, dateOfService: e.target.value })} aria-label="Date of service" />
              </div>
              <p className="ovr-small ovr-noprint">
                Edit anything below directly, replace the [BRACKETED] placeholders, then print.
              </p>
              <div className="ovr-letter" contentEditable suppressContentEditableWarning ref={letterRef}>
                {renderLetterText({ ...letter, ...stripEmpty(patient) }, claim)}
              </div>
              <div className="ovr-btnrow ovr-noprint">
                <button className="ovr-cta" onClick={() => window.print()}>Print / save as PDF</button>
              </div>
            </>
          )}
        </>
      )}
    </main>
  );
}

function stripEmpty<T extends Record<string, string>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(obj)) if (v) (out as Record<string, string>)[k] = v;
  return out;
}
