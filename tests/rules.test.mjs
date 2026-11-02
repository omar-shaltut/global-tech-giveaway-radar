import assert from 'node:assert/strict';
import { evaluateGiveaway, Decision } from '../src/rules.js';

const base = {
  name:'Test hardware giveaway', campaignUrl:'https://example.test/campaign',
  officialSourceUrl:'https://example.test/terms', officialSourceVerified:true,
  worldwide:true, endDate:'2099-12-31', evidence:[]
};

assert.equal(evaluateGiveaway({...base, paidEntry:true}).decision, Decision.REJECTED_SHARIAH_VIOLATION);
assert.equal(evaluateGiveaway({...base, paidAdvantage:true}).code, 'PAID_ADVANTAGE');
assert.equal(evaluateGiveaway({...base, libyaExplicitlyExcluded:true}).decision, Decision.REGION_INELIGIBLE);
assert.equal(evaluateGiveaway({...base, contentViolation:true, contentReason:'RELIGIOUS_PROMOTION'}).decision, Decision.REJECTED_CONTENT);
assert.equal(evaluateGiveaway({...base, officialSourceUrl:''}).decision, Decision.MANUAL_REVIEW);
assert.equal(evaluateGiveaway(base).decision, Decision.QUALIFIED);
assert.equal(evaluateGiveaway({...base, worldwide:false, libyaEligible:false}).code, 'NEEDS_GEO');
assert.equal(evaluateGiveaway({...base, endDate:'2020-01-01'}, new Date('2026-11-03T00:00:00Z')).decision, Decision.REJECTED_EXPIRED);
assert.equal(evaluateGiveaway({...base, endDate:'2020-01-01', entered:true}, new Date('2026-11-03T00:00:00Z')).decision, Decision.QUALIFIED);
console.log('All radar rule tests passed.');
