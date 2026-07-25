import type { Metadata } from "next";
import Link from "next/link";
import { LedgerProvider } from "@/components/fairbooks/LedgerContext";
import "./fairbooks.css";

export const metadata: Metadata = {
  title: "FairBooks — books your business can trust, and prove",
  description:
    "Paste a messy CSV, get auditable books, an integrity report, and a monthly close whose AI summary cannot misstate a number. For the DMV businesses below the accounting-software line.",
};

export default function FairbooksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fb">
      <div className="fb-banner">
        Your financial data stays in your browser — only anonymized text labels ever reach a
        server. Clarity layer, not a system of record; not tax or legal advice.
      </div>
      <div className="fb-wrap">
        <nav className="fb-nav">
          <Link href="/fairbooks" className="brand">Fair<span>Books</span></Link>
          <Link href="/fairbooks/books" className="navlink">Books</Link>
          <Link href="/fairbooks/integrity" className="navlink">Integrity</Link>
          <Link href="/fairbooks/operations" className="navlink">Operations</Link>
        </nav>
        <LedgerProvider>{children}</LedgerProvider>
      </div>
    </div>
  );
}
