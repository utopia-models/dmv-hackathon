// CSV parsing + header detection for messy bank exports. Deterministic, no deps.

export type RawRow = { date: string; description: string; amount: number; rawLine: string };

/** RFC-4180-lite line splitter (handles quoted fields with commas). */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cur += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$|^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
const MONEY_RE = /^-?\$?\s?-?[\d,]+(\.\d{1,2})?$/;

function parseDate(s: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? `20${m[3]}` : m[3];
    return `${y}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
  }
  return null;
}

function parseMoney(s: string): number | null {
  if (!MONEY_RE.test(s)) return null;
  const neg = s.includes("-");
  const n = parseFloat(s.replace(/[$,\s-]/g, ""));
  if (Number.isNaN(n)) return null;
  return neg ? -n : n;
}

/**
 * Parse a pasted CSV. Detects date/description/amount columns from the header
 * row if present, else by content heuristics on the first data row.
 */
export function parseCsv(text: string): { rows: RawRow[]; skipped: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (!lines.length) return { rows: [], skipped: 0 };

  let dateIdx = -1, descIdx = -1, amtIdx = -1, start = 0;
  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const hDate = header.findIndex((h) => /date|posted/.test(h));
  const hDesc = header.findIndex((h) => /desc|memo|detail|narrat|payee|merchant/.test(h));
  const hAmt = header.findIndex((h) => /amount|amt|value|debit|credit/.test(h));
  if (hDate >= 0 && hDesc >= 0 && hAmt >= 0) {
    dateIdx = hDate; descIdx = hDesc; amtIdx = hAmt; start = 1;
  } else {
    // Heuristics on the first row: date-shaped, money-shaped, longest-text columns
    const probe = splitCsvLine(lines[0]);
    dateIdx = probe.findIndex((c) => DATE_RE.test(c));
    amtIdx = probe.reduce((best, c, i) => (i !== dateIdx && MONEY_RE.test(c) ? i : best), -1);
    descIdx = probe.reduce(
      (best, c, i) => (i !== dateIdx && i !== amtIdx && c.length > (probe[best]?.length ?? -1) ? i : best),
      -1
    );
  }
  if (dateIdx < 0 || descIdx < 0 || amtIdx < 0) return { rows: [], skipped: lines.length };

  const rows: RawRow[] = [];
  let skipped = 0;
  for (let i = start; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const date = parseDate(cells[dateIdx] ?? "");
    const amount = parseMoney(cells[amtIdx] ?? "");
    const description = (cells[descIdx] ?? "").trim();
    if (!date || amount === null || !description) { skipped++; continue; }
    rows.push({ date, description, amount, rawLine: lines[i] });
  }
  return { rows, skipped };
}
