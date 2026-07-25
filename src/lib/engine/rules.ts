// Deterministic keyword categorization — the LLM fallback AND the seed demo's
// zero-LLM path. Pure function, shared by server and client.

import type { Category } from "@/lib/types";

type Rule = { re: RegExp; category: Category; confidence: number };

const RULES: Rule[] = [
  { re: /DEPOSIT ORDER|SQ DEPOSIT|SHOPIFY PAYOUT|STRIPE PAYOUT|SQUARE DEPOSIT/i, category: "revenue.sales", confidence: 0.9 },
  { re: /WHOLESALE|INV-\d+.*x\d+/i, category: "revenue.sales", confidence: 0.75 },
  { re: /SHIPPING INCOME|SHIPPING COLLECTED/i, category: "revenue.shipping", confidence: 0.9 },
  { re: /USPS|CLICK-N-SHIP|POSTAGE|UPS STORE|FEDEX|EASYPOST|SHIPSTATION/i, category: "expense.shipping", confidence: 0.9 },
  { re: /COFFEE IMPORT|GREEN COFFEE|SUPPLIER|IMPORT CO|PACKAGING|BURLAP|JUTE|WHOLESALE SUPPLY/i, category: "cogs.inventory", confidence: 0.8 },
  { re: /META ADS|FACEBOOK|GOOGLE ADS|TIKTOK ADS|INSTAGRAM|ADVERT/i, category: "expense.marketing", confidence: 0.9 },
  { re: /ADOBE|SHOPIFY SUB|SQUARESPACE|CANVA|QUICKBOOKS|SOFTWARE|SAAS|SUBSCRIPTION/i, category: "expense.software", confidence: 0.85 },
  { re: /TAX|SDAT|REGISTRATION FEE|LICENSE|LLC ANNUAL|FILING/i, category: "expense.taxes", confidence: 0.85 },
  { re: /RENT|LEASE/i, category: "expense.rent", confidence: 0.8 },
  { re: /DOMINION ENERGY|PEPCO|BGE|WASHINGTON GAS|UTILIT|WATER BILL/i, category: "expense.supplies", confidence: 0.7 },
  { re: /PAYROLL|GUSTO|BARISTA|WAGES|SALARY/i, category: "expense.professional", confidence: 0.9 },
  { re: /STALL FEE|MARKET FEE|SUPPLIES|COSTCO|RESTAURANT DEPOT/i, category: "expense.supplies", confidence: 0.7 },
  { re: /DUALSENSE|PLAYSTATION|XBOX|STEAM|NINTENDO|AIRBNB|HOTEL|RESORT|VACATION/i, category: "owner.draw", confidence: 0.7 },
  { re: /CASH DEPOSIT/i, category: "revenue.sales", confidence: 0.5 },
  { re: /TRANSFER|ZELLE TO SELF|VENMO TO SELF/i, category: "transfer", confidence: 0.6 },
];

export function keywordCategorize(description: string): { category: Category; confidence: number } {
  for (const r of RULES) {
    if (r.re.test(description)) return { category: r.category, confidence: r.confidence };
  }
  return { category: "uncategorized", confidence: 0 };
}
