export const emptyGiveaway = () => ({
  id: '', name: '', organizer: '', prize: '', category: 'tech-hardware',
  campaignUrl: '', officialSourceUrl: '', officialSourceVerified: false,
  discoveredAt: '', endDate: '', entered: false,
  worldwide: false, libyaEligible: false, libyaExplicitlyExcluded: false, regionHardLock: false,
  paidEntry: false, paidAdvantage: false, participantFundedDraw: false,
  gamblingOrBetting: false, prohibitedPrizeOrCondition: false,
  contentViolation: false, contentReason: '',
  manualReviewRequired: false, reviewReason: '',
  evidence: []
});

export const evidenceItem = ({ type, quote = '', url = '', source = 'official', capturedAt = '' }) => ({
  type, quote, url, source, capturedAt
});
