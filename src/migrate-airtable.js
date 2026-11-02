import { emptyGiveaway, evidenceItem } from './schema.js';

export const AIRTABLE_FIELDS = Object.freeze({
  lastChecked: 'fld3WaUmBdlJK8awe', nextAction: 'fld43xLy6TbpQxSIy', platform: 'fld4Mx53MDfckfSPV',
  discoveryChannel: 'fld9QORiItxU6ZIZl', approximateValueUsd: 'fldAINB96F4BThPT3', dailyTasks: 'fldATQvDU6csAbIEt',
  officialSourceUrl: 'fldJQcf4izXNY7KFb', organizer: 'fldJj4z8GrcvkPFf5', firstSeen: 'fldM2WUUdpl4vk8QV',
  winnerAnnouncementDate: 'fldM4nWxo1pfZZHi8', resolutionAttempts: 'fldMS9oYn8sSSVtpx', lifecycleStatus: 'fldMUDAbnO9yO3qq2',
  prize: 'fldRdegXiNyxlqQYy', verificationLevel: 'fldSMp71oUc9yAIWi', notes: 'fldZrxjXqdnOmuxP2',
  rejectionReason: 'fldZyRysqny2E1vsB', winnerName: 'flda2N9qbIPhZFORy', name: 'fldjG7snV61CXHHI7',
  resolutionStatus: 'fldjuTFuiO2OqBXvO', winnerRef: 'fldoUebICrnpEHe16', shippingStatus: 'fldp9iSp6U9Jg7a4D',
  libyaEligibility: 'fldpRTtnsTohh2BNu', claimDeadline: 'fldqgcofQf5YiTzU4', endDate: 'fldqvavIXOYJlzx8l',
  myEntries: 'fldrXqO0SSNtLWVzv', secretCode: 'fldrpSPsy3G0xr2dJ', participation: 'fldwRzMvJO4wPc9dt',
  campaignUrl: 'fldyYQ14JAIN7O628'
});

const value = (fields, key) => fields[AIRTABLE_FIELDS[key]];
const selectName = v => v && typeof v === 'object' && 'name' in v ? v.name : (v ?? '');
const text = v => typeof v === 'string' ? v.trim() : '';
const lower = v => text(v).toLowerCase();
const includesAny = (s, terms) => terms.some(t => s.includes(t));

function inferGeography(raw) {
  const geo = lower(selectName(raw));
  const worldwide = includesAny(geo, ['worldwide', 'global']);
  const excluded = includesAny(geo, ['excluded', 'ineligible', 'no', 'uk residents only']);
  const eligible = !excluded && (worldwide || includesAny(geo, ['confirmed eligible', 'eligible — libya', 'likely eligible']));
  return { worldwide, libyaEligible: eligible, libyaExplicitlyExcluded: excluded };
}

function inferFinancial(rejectionReason, notes) {
  const s = `${lower(rejectionReason)} ${lower(notes)}`;
  return {
    paidEntry: includesAny(s, ['paid_entry', 'paid entry', 'purchase-required entry']),
    paidAdvantage: includesAny(s, ['paid_advantage', 'unequal_paid_odds', 'indirect_paid_advantage']),
    participantFundedDraw: includesAny(s, ['participant_funded_draw']),
    gamblingOrBetting: includesAny(s, ['gambling', 'betting brand', 'wager']),
    prohibitedPrizeOrCondition: includesAny(s, ['prohibited prize', 'cannabis', 'astrology', 'divination'])
  };
}

function inferContent(rejectionReason, notes) {
  const s = `${lower(rejectionReason)} ${lower(notes)}`;
  const contentViolation = includesAny(s, ['content_policy', 'rejected_content', 'content policy', 'halloween', 'occult', 'religious/occult', 'revealing clothing', 'musical-instrument', 'musical equipment']);
  return { contentViolation, contentReason: contentViolation ? text(rejectionReason) || 'LEGACY_CONTENT_POLICY' : '' };
}

function inferOfficialSourceVerified(verificationLevel, officialSourceUrl, campaignUrl) {
  const v = lower(selectName(verificationLevel));
  if (!officialSourceUrl && !campaignUrl) return false;
  if (includesAny(v, ['official', 'user-confirmed', 'direct campaign', 'direct platform'])) return true;
  return false;
}

function inferManualReview(resolutionStatus, rejectionReason, nextAction) {
  const status = selectName(resolutionStatus);
  const s = `${lower(rejectionReason)} ${lower(nextAction)}`;
  if (status === 'LEAD_UNRESOLVED' || status === 'LEGACY_REVIEW' || status === 'EXPIRED_UNRESOLVED') {
    return { manualReviewRequired: true, reviewReason: text(nextAction) || status };
  }
  if (includesAny(s, ['needs_geo', 'needs_fulfillment', 'needs_both', 'needs_organizer_id', 'needs_digital_redemption', 'needs_financial_detail', 'outreach_required', 'awaiting_support_reply'])) {
    return { manualReviewRequired: true, reviewReason: text(nextAction) || text(rejectionReason) };
  }
  return { manualReviewRequired: false, reviewReason: '' };
}

export function migrateAirtableRecord(record, migratedAt = new Date().toISOString()) {
  const fields = record?.cellValuesByFieldId || {};
  const g = emptyGiveaway();
  const participation = selectName(value(fields, 'participation')) || 'Unknown';
  const geo = inferGeography(value(fields, 'libyaEligibility'));
  const rejectionReason = text(value(fields, 'rejectionReason'));
  const notes = text(value(fields, 'notes'));
  const content = inferContent(rejectionReason, notes);
  const financial = inferFinancial(rejectionReason, notes);
  const review = inferManualReview(value(fields, 'resolutionStatus'), rejectionReason, value(fields, 'nextAction'));

  Object.assign(g, {
    id: record.id, legacyId: record.id,
    name: text(value(fields, 'name')), organizer: text(value(fields, 'organizer')), prize: text(value(fields, 'prize')),
    platform: selectName(value(fields, 'platform')), discoveryChannel: selectName(value(fields, 'discoveryChannel')),
    campaignUrl: text(value(fields, 'campaignUrl')), officialSourceUrl: text(value(fields, 'officialSourceUrl')),
    officialSourceVerified: inferOfficialSourceVerified(value(fields, 'verificationLevel'), text(value(fields, 'officialSourceUrl')), text(value(fields, 'campaignUrl'))),
    verificationLevel: selectName(value(fields, 'verificationLevel')),
    discoveredAt: record.createdTime || '', firstSeen: text(value(fields, 'firstSeen')), lastChecked: text(value(fields, 'lastChecked')),
    endDate: text(value(fields, 'endDate')), winnerAnnouncementDate: text(value(fields, 'winnerAnnouncementDate')),
    lifecycleStatus: selectName(value(fields, 'lifecycleStatus')), resolutionStatus: selectName(value(fields, 'resolutionStatus')),
    rejectionReason, resolutionAttempts: Number(value(fields, 'resolutionAttempts') || 0),
    participation, entered: participation === 'Entered' || participation === 'Completed' || participation === 'Won' || participation === 'Did not win',
    myEntries: Number(value(fields, 'myEntries') || 0), dailyTasks: text(value(fields, 'dailyTasks')), secretCode: text(value(fields, 'secretCode')),
    nextAction: text(value(fields, 'nextAction')), notes, claimDeadline: text(value(fields, 'claimDeadline')),
    winnerName: text(value(fields, 'winnerName')), winnerRef: text(value(fields, 'winnerRef')),
    approximateValueUsd: value(fields, 'approximateValueUsd') == null ? null : Number(value(fields, 'approximateValueUsd')),
    libyaEligibilityText: selectName(value(fields, 'libyaEligibility')), shippingStatus: selectName(value(fields, 'shippingStatus')),
    ...geo, ...financial, ...content, ...review,
    regionHardLock: includesAny(lower(rejectionReason), ['region_ineligible', 'promotion unavailable', 'not available in your region', 'not available in your country', 'not available in your location']),
    evidence: [
      ...(text(value(fields, 'officialSourceUrl')) ? [evidenceItem({ type: 'official-source', url: text(value(fields, 'officialSourceUrl')), source: 'legacy-airtable', capturedAt: text(value(fields, 'lastChecked')) })] : []),
      ...(rejectionReason ? [evidenceItem({ type: 'legacy-decision', quote: rejectionReason, url: text(value(fields, 'campaignUrl')), source: 'legacy-airtable', capturedAt: text(value(fields, 'lastChecked')) })] : []),
      ...(notes ? [evidenceItem({ type: 'legacy-notes', quote: notes, url: text(value(fields, 'officialSourceUrl')), source: 'legacy-airtable', capturedAt: text(value(fields, 'lastChecked')) })] : [])
    ],
    migration: { source: 'airtable:appDWijaRRcD8oFI9/tbldZAKYD2IdB6nNM', sourceRecordId: record.id, migratedAt, warnings: [] }
  });

  if (!g.name) g.migration.warnings.push('MISSING_NAME');
  if (!g.campaignUrl) g.migration.warnings.push('MISSING_CAMPAIGN_URL');
  if (!g.officialSourceUrl) g.migration.warnings.push('MISSING_OFFICIAL_SOURCE_URL');
  return g;
}

export function migrateAirtablePayload(payload, migratedAt = new Date().toISOString()) {
  const records = Array.isArray(payload) ? payload : payload?.records;
  if (!Array.isArray(records)) throw new TypeError('Expected Airtable records array or {records:[...]}');
  return records.map(r => migrateAirtableRecord(r, migratedAt));
}
