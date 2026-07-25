"use client";

// Charts per the dataviz method: thin marks, 4px rounded data-ends at the top only,
// 2px gaps between fills, recessive grid, legend for the 2-series chart,
// hover tooltips on every mark, text in ink tokens (never series color).

import { useMemo, useRef, useState } from "react";
import type { MonthlyRollup, CashPoint } from "@/lib/engine/pnl";
import { fmtUsd } from "@/lib/engine/pnl";

type Tip = { x: number; y: number; text: string } | null;

function monthLabel(m: string): string {
  const [y, mo] = m.split("-");
  return new Date(`${y}-${mo}-15`).toLocaleDateString("en-US", { month: "short" });
}

/** Revenue vs expenses — grouped bars, 2 fixed series hues, legend + tooltips. */
export function MonthBars({ months }: { months: MonthlyRollup[] }) {
  const [tip, setTip] = useState<Tip>(null);
  const ref = useRef<HTMLDivElement>(null);
  const W = 560, H = 200, PAD = 30, BOTTOM = 24;
  const max = Math.max(1, ...months.flatMap((m) => [m.revenueCents, m.expenseCents]));
  const groupW = (W - PAD * 2) / Math.max(1, months.length);
  const barW = Math.min(38, groupW / 2 - 4);

  const show = (e: React.MouseEvent, text: string) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: e.clientX - box.left, y: e.clientY - box.top, text });
  };

  return (
    <div className="fb-chart" ref={ref}>
      <div className="title">Revenue vs expenses by month</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Monthly revenue and expenses bar chart">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={H - BOTTOM - f * (H - BOTTOM - 12)} y2={H - BOTTOM - f * (H - BOTTOM - 12)}
            stroke="currentColor" opacity={0.08} />
        ))}
        {months.map((m, i) => {
          const x0 = PAD + i * groupW + groupW / 2;
          const hRev = (m.revenueCents / max) * (H - BOTTOM - 12);
          const hExp = (m.expenseCents / max) * (H - BOTTOM - 12);
          return (
            <g key={m.month}>
              <rect x={x0 - barW - 1} y={H - BOTTOM - hRev} width={barW} height={hRev} rx={4}
                fill="var(--series-rev)"
                onMouseMove={(e) => show(e, `${monthLabel(m.month)} revenue · ${fmtUsd(m.revenueCents)}`)}
                onMouseLeave={() => setTip(null)} />
              <rect x={x0 + 1} y={H - BOTTOM - hExp} width={barW} height={hExp} rx={4}
                fill="var(--series-exp)"
                onMouseMove={(e) => show(e, `${monthLabel(m.month)} expenses · ${fmtUsd(m.expenseCents)}`)}
                onMouseLeave={() => setTip(null)} />
              <text x={x0} y={H - 7} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.65}>
                {monthLabel(m.month)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="fb-legend">
        <span><span className="swatch" style={{ background: "var(--series-rev)" }} />Revenue</span>
        <span><span className="swatch" style={{ background: "var(--series-exp)" }} />Expenses</span>
      </div>
      {tip && <div className="fb-tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
    </div>
  );
}

/** Cash balance over time — single-series area line (no legend: the title names it). */
export function CashChart({ points }: { points: CashPoint[] }) {
  const [tip, setTip] = useState<Tip>(null);
  const [cross, setCross] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const W = 560, H = 170, PAD = 30, BOTTOM = 20;

  const { path, area, xs, ys } = useMemo(() => {
    if (!points.length) return { path: "", area: "", xs: [] as number[], ys: [] as number[] };
    const min = Math.min(0, ...points.map((p) => p.balanceCents));
    const max = Math.max(1, ...points.map((p) => p.balanceCents));
    const xs = points.map((_, i) => PAD + (i / Math.max(1, points.length - 1)) * (W - PAD * 2));
    const ys = points.map((p) => 12 + (1 - (p.balanceCents - min) / (max - min)) * (H - BOTTOM - 24));
    const path = xs.map((x, i) => `${i ? "L" : "M"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
    const area = `${path} L${xs[xs.length - 1]},${H - BOTTOM} L${xs[0]},${H - BOTTOM} Z`;
    return { path, area, xs, ys };
  }, [points]);

  if (!points.length) return null;

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const box = ref.current?.getBoundingClientRect();
    const svgBox = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
    if (!box) return;
    const relX = ((e.clientX - svgBox.left) / svgBox.width) * W;
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - relX) < Math.abs(xs[best] - relX)) best = i;
    setCross(best);
    setTip({
      x: e.clientX - box.left,
      y: e.clientY - box.top,
      text: `${points[best].date} · ${fmtUsd(points[best].balanceCents)}`,
    });
  };

  return (
    <div className="fb-chart" ref={ref}>
      <div className="title">Cash balance over time</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Cash balance line chart"
        onMouseMove={onMove} onMouseLeave={() => { setTip(null); setCross(null); }}>
        <line x1={PAD} x2={W - PAD} y1={H - BOTTOM} y2={H - BOTTOM} stroke="currentColor" opacity={0.15} />
        <path d={area} fill="var(--series-rev)" opacity={0.12} />
        <path d={path} fill="none" stroke="var(--series-rev)" strokeWidth={2} />
        {cross !== null && (
          <g>
            <line x1={xs[cross]} x2={xs[cross]} y1={10} y2={H - BOTTOM} stroke="currentColor" opacity={0.25} />
            <circle cx={xs[cross]} cy={ys[cross]} r={4.5} fill="var(--series-rev)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {tip && <div className="fb-tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
    </div>
  );
}
