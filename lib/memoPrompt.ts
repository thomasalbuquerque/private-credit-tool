import type { Deal, DueDiligence, Security } from '@/types';

export const MEMO_SYSTEM_PROMPT = `You are a private credit investment professional writing an Investment Committee (IC) memo.

Rules you must follow:
- Use ONLY the data provided in the user message. Never invent figures, names, or facts, and never use
  placeholders such as [TBD], [insert], or similar.
- Write in plain text. Do not use markdown tables, code fences, or any markdown syntax other than
  section headings.
- Format each section heading exactly as "## Section Name" on its own line, followed by the body text
  or bullet points for that section.
- Output the following sections, in this exact order:
  1. Investment Recommendation
  2. Executive Summary
  3. Investment Thesis
  4. Financial Overview
  5. Key Risks
  6. Mitigants
  7. Recommendation
- In the "Key Risks" section, reference each due diligence finding by its exact title as given in the data.
- Keep the overall memo between 500 and 800 words.
- Write in a formal, professional tone suitable for presentation to an Investment Committee.`;

interface BuildMemoPromptParams {
  deal: Deal;
  security?: Security;
  dueDiligence?: DueDiligence;
}

export function buildMemoPrompt({ deal, security, dueDiligence }: BuildMemoPromptParams): string {
  const findings = dueDiligence?.findings ?? [];

  const lines: string[] = [];

  lines.push('DEAL DATA');
  lines.push(`Company name: ${deal.companyName}`);
  lines.push(`Industry: ${deal.industry}`);
  lines.push(`Sponsor: ${deal.sponsor}`);
  lines.push(`Deal owner: ${deal.owner}`);
  lines.push(`Stage: ${deal.stage}`);
  lines.push(`Deal size: ${deal.dealSize}`);
  lines.push(`Revenue: ${deal.revenue}`);
  lines.push(`EBITDA: ${deal.ebitda}`);
  lines.push(`Leverage: ${deal.leverage}x`);
  lines.push(`Risk score: ${deal.riskScore}/100`);
  lines.push(
    `Risk breakdown: financials=${deal.riskBreakdown.financials}, collateral=${deal.riskBreakdown.collateral}, industry=${deal.riskBreakdown.industry}, legal=${deal.riskBreakdown.legal}`
  );

  lines.push('');
  lines.push('SECURITY DATA');
  if (security) {
    lines.push(`Type: ${security.type}`);
    lines.push(`Amount: ${security.amount}`);
    lines.push(`Rate: ${security.rate}`);
    lines.push(`Maturity: ${security.maturity}`);
    lines.push(`Origination fee: ${security.originationFee}`);
    lines.push(
      `Covenants: ${
        security.covenants.length > 0
          ? security.covenants.map((c) => `${c.name} (${c.threshold})`).join('; ')
          : 'None specified'
      }`
    );
    lines.push(
      `Collateral: ${security.collateral.length > 0 ? security.collateral.join('; ') : 'None specified'}`
    );
  } else {
    lines.push('No security data available for this deal.');
  }

  lines.push('');
  lines.push('DUE DILIGENCE FINDINGS');
  if (findings.length > 0) {
    findings.forEach((finding, index) => {
      lines.push(`${index + 1}. Title: ${finding.title}`);
      lines.push(`   Risk level: ${finding.riskLevel}`);
      lines.push(`   Status: ${finding.status}`);
      lines.push(`   Description: ${finding.description}`);
      lines.push(`   Mitigation: ${finding.mitigation}`);
      lines.push(`   Owner: ${finding.owner}`);
    });
  } else {
    lines.push('No due diligence findings recorded for this deal.');
  }

  return lines.join('\n');
}
