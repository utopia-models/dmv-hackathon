// DC/MD/VA small-business compliance reminders — deterministic, jurisdiction-keyed.
// All dates/cycles verified against official sources 2026-07-25 (DC OTR, DC DLCP,
// MD SDAT, VA SCC). Reminders, not tax or legal advice.

import type { Business } from "@/lib/types";

export type ComplianceItem = {
  id: string;
  jurisdiction: Business["jurisdiction"];
  title: string;
  cadence: string;
  detail: string;
};

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  {
    id: "dc-fr800-monthly",
    jurisdiction: "DC",
    title: "Sales & use tax return (FR-800M)",
    cadence: "Monthly — due the 20th of the following month",
    detail:
      "Monthly filing applies when sales-tax liability exceeds $1,200 per period. Smaller filers use FR-800Q (quarterly, due the 20th after quarter end) or FR-800A (annual, ≤$200, due October 20). File on MyTax.DC.gov.",
  },
  {
    id: "dc-bbl",
    jurisdiction: "DC",
    title: "Basic Business License renewal",
    cadence: "Every 2 years (4-year option available)",
    detail:
      "Licenses run to the last day of the issuance month. Renewable up to 90 days before expiry at mybusiness.dc.gov; DLCP emails reminders at 90/60/30/7 days.",
  },
  {
    id: "md-form1",
    jurisdiction: "MD",
    title: "Annual Report (SDAT Form 1)",
    cadence: "Every year — April 15",
    detail:
      "$300 filing fee for LLCs and corporations, combined with the business personal property return. A free extension to June 15 is available if requested by April 15.",
  },
  {
    id: "va-registration",
    jurisdiction: "VA",
    title: "LLC annual registration fee",
    cadence: "Every year — last day of your formation-anniversary month",
    detail: "$50 fee to the Virginia SCC; a $25 penalty applies if late.",
  },
];

export function complianceFor(j: Business["jurisdiction"]): ComplianceItem[] {
  return COMPLIANCE_ITEMS.filter((c) => c.jurisdiction === j);
}
