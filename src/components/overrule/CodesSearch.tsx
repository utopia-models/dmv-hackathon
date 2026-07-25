"use client";

import { useEffect, useMemo, useState } from "react";
import type { Icd10Entry } from "@/lib/overrule-types";
import { ALL_DENIAL_CODES } from "@/data/carc-rarc";

export default function CodesSearch() {
  const [q, setQ] = useState("");
  const [icd, setIcd] = useState<Icd10Entry[]>([]);
  const [searching, setSearching] = useState(false);

  // Denial-code matches: instant, client-side, deterministic.
  const denialMatches = useMemo(() => {
    const t = q.trim().toUpperCase();
    if (t.length < 2) return [];
    return ALL_DENIAL_CODES.filter(
      (e) =>
        `${e.type === "CARC" ? e.group + "-" : ""}${e.code}`.includes(t) ||
        e.meaning.toUpperCase().includes(t) ||
        e.category.toUpperCase().includes(t)
    ).slice(0, 12);
  }, [q]);

  // ICD-10 matches: debounced server search over the full 98k-code CMS table.
  useEffect(() => {
    const t = q.trim();
    if (t.length < 2) {
      setIcd([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await fetch(`/api/icd10?q=${encodeURIComponent(t)}`);
        const data = await r.json();
        setIcd(data.results ?? []);
      } catch {
        setIcd([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <main>
      <h1>The code tables</h1>
      <p className="lede">
        Search the full ICD-10-CM 2026 dataset — 98,186 diagnosis codes, downloaded fresh from
        CMS.gov today (see DOWNLOAD-LOG.md in the repo) — plus every CARC/RARC denial code we
        decode. All lookups are deterministic; no AI here.
      </p>
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Try “diabetes”, “M54.16”, “CO-50”, “timely filing”…"
        aria-label="Search codes"
        style={{ maxWidth: "32rem" }}
      />

      {denialMatches.length > 0 && (
        <>
          <h2>Denial codes</h2>
          <div className="ovr-cards">
            {denialMatches.map((e) => {
              const display = e.type === "CARC" ? `${e.group}-${e.code}` : e.code;
              return (
                <div className="ovr-card" key={display}>
                  <span className="code">{display}</span>
                  <span className={`ovr-badge ${e.appealable}`}>
                    {e.appealable === "yes" ? "Appealable" : e.appealable === "sometimes" ? "Sometimes appealable" : "Not typically appealable"}
                  </span>
                  <span className="meaning">{e.meaning}</span>
                  <span className="plain">{e.plainEnglish}</span>
                  <span className="action"><b>Next step:</b> {e.nextAction}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {(icd.length > 0 || searching) && (
        <>
          <h2>ICD-10-CM 2026 {searching && <span className="ovr-spin">searching</span>}</h2>
          <ul className="ovr-results">
            {icd.map((e) => (
              <li key={e.code}>
                <span className="rcode">{e.code}</span>
                {e.billable && <span className="rbill">billable</span>}
                <span>{e.description}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
