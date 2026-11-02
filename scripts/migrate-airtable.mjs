import fs from 'node:fs';
import path from 'node:path';
import { migrateAirtablePayload } from '../src/migrate-airtable.js';

const [input = 'data/airtable-export.json', output = 'data/giveaways.json'] = process.argv.slice(2);
if (!fs.existsSync(input)) {
  console.error(`Input not found: ${input}`);
  process.exit(2);
}
const payload = JSON.parse(fs.readFileSync(input, 'utf8'));
const migratedAt = new Date().toISOString();
const rows = migrateAirtablePayload(payload, migratedAt);
const envelope = {
  schemaVersion: 2,
  source: 'Airtable Giveaway Radar',
  migratedAt,
  recordCount: rows.length,
  giveaways: rows
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(envelope, null, 2)}\n`);
console.log(`Migrated ${rows.length} Airtable records -> ${output}`);
