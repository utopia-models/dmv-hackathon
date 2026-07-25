import type { Metadata } from "next";
import Link from "next/link";
import "./overrule.css";

export const metadata: Metadata = {
  title: "Overrule — decode your insurance denial, write your appeal",
  description:
    "Free tool that decodes insurance denial letters into plain English and generates a print-ready appeal letter. No signup, nothing stored.",
};

export default function OverruleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ovr">
      <div className="ovr-banner">
        Educational tool — not medical, legal, or billing advice. Nothing you paste is stored.
      </div>
      <div className="ovr-wrap">
        <nav className="ovr-nav">
          <Link href="/overrule" className="brand">
            Over<span>rule</span>
          </Link>
          <Link href="/overrule/decode" className="navlink">Decode a denial</Link>
          <Link href="/overrule/codes" className="navlink">Code reference</Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
