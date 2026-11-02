import assert from 'node:assert/strict';
import { migrateAirtableRecord } from '../src/migrate-airtable.js';

const rec = {
  id: 'recTEST1234567890', createdTime: '2026-10-01T00:00:00.000Z',
  cellValuesByFieldId: {
    fldjG7snV61CXHHI7: 'Example Worldwide GPU Giveaway',
    fldJj4z8GrcvkPFf5: 'Example',
    fldRdegXiNyxlqQYy: 'RTX GPU',
    fldyYQ14JAIN7O628: 'https://example.test/campaign',
    fldJQcf4izXNY7KFb: 'https://example.test/rules',
    fldSMp71oUc9yAIWi: { name: 'Official rules/source' },
    fldpRTtnsTohh2BNu: { name: 'Worldwide – Libya not excluded' },
    fldwRzMvJO4wPc9dt: { name: 'Entered' },
    fldrXqO0SSNtLWVzv: 10,
    fldjuTFuiO2OqBXvO: { name: 'QUALIFIED' },
    fldMS9oYn8sSSVtpx: 2
  }
};
const g = migrateAirtableRecord(rec, '2026-11-03T00:00:00.000Z');
assert.equal(g.schemaVersion, 2);
assert.equal(g.legacyId, rec.id);
assert.equal(g.worldwide, true);
assert.equal(g.libyaEligible, true);
assert.equal(g.entered, true);
assert.equal(g.myEntries, 10);
assert.equal(g.officialSourceVerified, true);
assert.equal(g.migration.sourceRecordId, rec.id);
console.log('migration tests passed');
