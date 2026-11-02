export const Decision = Object.freeze({
  QUALIFIED: 'QUALIFIED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  REJECTED_SHARIAH_VIOLATION: 'REJECTED_SHARIAH_VIOLATION',
  REGION_INELIGIBLE: 'REGION_INELIGIBLE',
  REJECTED_CONTENT: 'REJECTED_CONTENT',
  REJECTED_EXPIRED: 'REJECTED_EXPIRED',
  REJECTED_SOURCE: 'REJECTED_SOURCE'
});

const reject = (decision, code, evidence = []) => ({ decision, code, evidence });

export function evaluateGiveaway(g, now = new Date()) {
  const evidence = Array.isArray(g.evidence) ? g.evidence : [];

  // Hard Shariah/financial exclusions. These are rule flags supported by evidence,
  // not model guesses or autonomous fatwas.
  if (g.paidEntry === true) return reject(Decision.REJECTED_SHARIAH_VIOLATION, 'PAID_ENTRY', evidence);
  if (g.participantFundedDraw === true) return reject(Decision.REJECTED_SHARIAH_VIOLATION, 'PARTICIPANT_FUNDED_DRAW', evidence);
  if (g.paidAdvantage === true) return reject(Decision.REJECTED_SHARIAH_VIOLATION, 'PAID_ADVANTAGE', evidence);
  if (g.gamblingOrBetting === true) return reject(Decision.REJECTED_SHARIAH_VIOLATION, 'GAMBLING_OR_BETTING', evidence);
  if (g.prohibitedPrizeOrCondition === true) return reject(Decision.REJECTED_SHARIAH_VIOLATION, 'PROHIBITED_PRIZE_OR_CONDITION', evidence);

  // Prospective content gate.
  if (g.contentViolation === true) return reject(Decision.REJECTED_CONTENT, g.contentReason || 'CONTENT_POLICY', evidence);

  // Geography v1.8: explicit exclusion/hard lock controls. Worldwide is otherwise acceptable.
  if (g.libyaExplicitlyExcluded === true || g.regionHardLock === true)
    return reject(Decision.REGION_INELIGIBLE, 'LIBYA_OR_REGION_EXCLUDED', evidence);
  if (g.worldwide !== true && g.libyaEligible !== true)
    return reject(Decision.MANUAL_REVIEW, 'NEEDS_GEO', evidence);

  // Lifecycle: do not discard entered campaigns merely because entry closed.
  if (g.endDate) {
    const end = new Date(`${g.endDate}T23:59:59Z`);
    if (!Number.isNaN(end.valueOf()) && end < now && g.entered !== true)
      return reject(Decision.REJECTED_EXPIRED, 'CAMPAIGN_ENDED_NOT_ENTERED', evidence);
  }

  // Evidence gate. Aggregator-only leads never qualify.
  if (!g.campaignUrl || !g.officialSourceUrl)
    return reject(Decision.MANUAL_REVIEW, 'NEEDS_OFFICIAL_SOURCE', evidence);
  if (g.officialSourceVerified !== true)
    return reject(Decision.MANUAL_REVIEW, 'OFFICIAL_SOURCE_UNVERIFIED', evidence);

  if (g.manualReviewRequired === true)
    return reject(Decision.MANUAL_REVIEW, g.reviewReason || 'MANUAL_REVIEW_REQUIRED', evidence);

  return { decision: Decision.QUALIFIED, code: 'ALL_GATES_PASS', evidence };
}

export function dedupeKey(g) {
  const url = (g.campaignUrl || '').trim().toLowerCase().replace(/\/$/, '');
  const name = (g.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return url || name;
}
