// Deploy all seed batch SQL files to Supabase via REST API
// Usage: node scripts/seed-to-supabase.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

// Parse SQL INSERT into array of card objects
function parseInsertSQL(sql) {
  // Extract VALUES section
  const valuesMatch = sql.match(/VALUES\s*([\s\S]+?)\s*;/);
  if (!valuesMatch) {
    console.error('  Could not find VALUES section');
    return [];
  }

  const valuesStr = valuesMatch[1];
  const cards = [];

  // State machine parser for SQL tuples
  let i = 0;
  const len = valuesStr.length;

  function skipWhitespace() {
    while (i < len && /\s/.test(valuesStr[i])) i++;
  }

  function readString() {
    // Expect current char to be '
    if (valuesStr[i] !== "'") return null;
    i++; // skip opening quote
    let result = '';
    while (i < len) {
      if (valuesStr[i] === "'" && valuesStr[i + 1] === "'") {
        result += "'";
        i += 2;
      } else if (valuesStr[i] === "'") {
        i++; // skip closing quote
        return result;
      } else {
        result += valuesStr[i];
        i++;
      }
    }
    return result;
  }

  function readArray() {
    // Expect ARRAY[...]
    if (valuesStr.substring(i, i + 6) !== 'ARRAY[') return null;
    i += 6; // skip ARRAY[
    const items = [];
    skipWhitespace();
    if (valuesStr[i] === ']') {
      i++;
      return items;
    }
    while (i < len) {
      skipWhitespace();
      if (valuesStr[i] === ']') {
        i++;
        return items;
      }
      if (valuesStr[i] === ',') { i++; skipWhitespace(); continue; }
      const item = readString();
      if (item !== null) items.push(item);
    }
    return items;
  }

  function readJsonb() {
    // Read a string and parse as JSON
    const str = readString();
    if (str === null) return null;
    // Skip ::jsonb if present
    if (valuesStr.substring(i, i + 7) === '::jsonb') i += 7;
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error('  JSON parse error:', str.substring(0, 50));
      return [];
    }
  }

  function readField() {
    skipWhitespace();
    if (valuesStr[i] === "'") return readString();
    if (valuesStr.substring(i, i + 6) === 'ARRAY[') return readArray();
    return null;
  }

  function readTuple() {
    skipWhitespace();
    if (valuesStr[i] !== '(') return null;
    i++; // skip (

    const fields = [];
    while (i < len) {
      skipWhitespace();
      if (valuesStr[i] === ')') {
        i++; // skip )
        return fields;
      }
      if (valuesStr[i] === ',') { i++; continue; }

      // Determine field type
      if (valuesStr.substring(i, i + 6) === 'ARRAY[') {
        fields.push(readArray());
      } else if (valuesStr[i] === "'") {
        // Check if next field is ::jsonb (look ahead after closing quote)
        const startI = i;
        const str = readString();
        skipWhitespace();
        if (valuesStr.substring(i, i + 7) === '::jsonb') {
          i += 7;
          try {
            fields.push(JSON.parse(str));
          } catch (e) {
            console.error('  JSON parse error for field, str start:', str.substring(0, 30));
            fields.push([]);
          }
        } else {
          fields.push(str);
          // Backtrack - we already consumed the string, no need to go back
        }
      } else {
        i++; // skip unknown char
      }
    }
    return fields;
  }

  // Read all tuples
  while (i < len) {
    skipWhitespace();
    if (i >= len) break;
    if (valuesStr[i] === ',') { i++; continue; }
    if (valuesStr[i] !== '(') { i++; continue; }

    const tuple = readTuple();
    if (tuple && tuple.length === 12) {
      cards.push({
        id: tuple[0],
        slug: tuple[1],
        title: tuple[2],
        one_liner: tuple[3],
        category_id: tuple[4],
        tags: tuple[5],
        difficulty: tuple[6],
        card_type: tuple[7],
        content: tuple[8],
        key_data: tuple[9],
        references: tuple[10],
        related_card_ids: tuple[11],
      });
    }
  }

  return cards;
}

async function deploy() {
  const batches = ['seed_batch1.sql', 'seed_batch2.sql', 'seed_batch3.sql', 'seed_batch4.sql'];
  let totalInserted = 0;
  let totalFailed = 0;

  for (const batch of batches) {
    const filePath = path.join(__dirname, '..', 'supabase', batch);
    if (!fs.existsSync(filePath)) {
      console.log(`Skipping ${batch} (not found)`);
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    const cards = parseInsertSQL(sql);
    console.log(`\n=== ${batch}: Parsed ${cards.length} cards ===`);

    if (cards.length === 0) {
      console.log('  No cards parsed, skipping');
      continue;
    }

    // Insert in batches of 5 to avoid payload size limits
    for (let j = 0; j < cards.length; j += 5) {
      const chunk = cards.slice(j, j + 5);
      const { data, error } = await sb.from('cards').insert(chunk).select('id');

      if (error) {
        console.error(`  INSERT ERROR (${chunk.map(c => c.id).join(', ')}):`, error.message);
        // Try one by one
        for (const card of chunk) {
          const { error: e2 } = await sb.from('cards').insert(card);
          if (e2) {
            console.error(`    FAILED ${card.id}:`, e2.message);
            totalFailed++;
          } else {
            console.log(`    OK: ${card.id} - ${card.title}`);
            totalInserted++;
          }
        }
      } else {
        data.forEach(c => console.log(`  OK: ${c.id}`));
        totalInserted += data.length;
      }
    }
  }

  // Verify final state
  const { data: allCards } = await sb.from('cards').select('id, category_id').order('id');
  console.log(`\n========== SUMMARY ==========`);
  console.log(`Inserted: ${totalInserted}, Failed: ${totalFailed}`);
  console.log(`Total cards in DB: ${allCards.length}`);

  const byCategory = {};
  allCards.forEach(c => {
    byCategory[c.category_id] = (byCategory[c.category_id] || 0) + 1;
  });
  console.log('\nBy category:');
  Object.entries(byCategory).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count} cards`);
  });
}

deploy().catch(e => console.error('Fatal:', e));
