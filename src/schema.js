export const emptyGiveaway = () => ({
  schemaVersion: 2,
  id: '',
  legacyId: '',
  name: '', organizer: '', prize: '', category: 'tech-hardware',
  platform: '', discoveryChannel: '',
  campaignUrl: '', officialSourceUrl: '', officialSourceVerified: false,
  verificationLevel: '',
  discoveredAt: '', firstSeen: '', lastChecked: '', endDate: '', winnerAnnouncementDate: '',
  lifecycleStatus: '', resolutionStatus: '', rejectionReason: '', resolutionAttempts: 0,
  participation: 'Unknown', entered: false, myEntries: 0,
  dailyTasks: '', secretCode: '', nextAction: '', notes: '', claimDeadline: '',
  winnerName: '', winnerRef: '', approximateValueUsd: null,
  worldwide: false, libyaEligible: false, libyaEligibilityText: '',
  libyaExplicitlyExcluded: false, regionHardLock: false,
  shippingStatus: '',
  paidEntry: false, paidAdvantage: false, participantFundedDraw: false,
  gamblingOrBetting: false, prohibitedPrizeOrCondition: false,
  contentViolation: false, contentReason: '',
  manualReviewRequired: false, reviewReason: '',
  evidence: [],
  migration: { source: '', sourceRecordId: '', migratedAt: '', warnings: [] }
});

export const evidenceItem = ({ type, quote = '', url = '', source = 'official', capturedAt = '' }) => ({
  type, quote, url, source, capturedAt
});
