import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The ICD-10 TSV is read with fs at runtime — trace it into the serverless fn.
  outputFileTracingIncludes: {
    "/api/icd10": ["./src/data/icd10.tsv"],
  },
};

export default nextConfig;
