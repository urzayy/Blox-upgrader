import fs from 'node:fs';

const transcriptPath =
  'C:/Users/hugou/.cursor/projects/c-Users-hugou-cs2-skin-upgrade/agent-transcripts/8c8305de-136c-4bce-b9a2-b8d24518abf7/8c8305de-136c-4bce-b9a2-b8d24518abf7.jsonl';

const slugs = [
  'edge-protocol', 'striker-knife', 'sport-palm', 'blade-roulette', 'operator-wrap',
  'chrome-factory', 'violet-storm', 'ember-core', 'toxic-alley', 'midnight-run',
  'gold-reserve', 'ruby-raid', 'sapphire-code', 'phantom-grid', 'riot-zone',
  'cutlass-box', 'kings-gambit', 'apex-cache', 'driver-lane', 'hand-wraps-box',
  'sharpened', 'mystery-hex', 'night-market', 'covert-reactor', 'overdrive', 'classified-hub',
];

const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');
const configs = {};

for (const line of lines) {
  if (!line.includes('StrReplace') || !line.includes('caseCatalog.ts')) continue;
  try {
    const obj = JSON.parse(line);
    for (const part of obj.message?.content || []) {
      if (part.type !== 'tool_use' || part.name !== 'StrReplace') continue;
      const ns = part.input?.new_string || '';
      if (!ns.includes('slug:')) continue;
      for (const slug of slugs) {
        if (ns.includes(`slug: '${slug}'`)) {
          configs[slug] = ns;
        }
      }
    }
  } catch {
    // skip malformed lines
  }
}

const out = {};
for (const slug of slugs) {
  if (!configs[slug]) {
    console.error('MISSING:', slug);
    continue;
  }
  const block = configs[slug];
  const priceMatch = block.match(/price: ([0-9.]+)/);
  const featuredMatch = block.match(/featuredSkinId: '([^']+)'/);
  const entries = [...block.matchAll(/\{ skinId: '([^']+)', chance: ([0-9.]+) \}/g)].map(m => ({
    skinId: m[1],
    chance: Number(m[2]),
  }));
  out[slug] = {
    price: Number(priceMatch?.[1] ?? 0),
    featuredSkinId: featuredMatch?.[1] ?? '',
    entries,
  };
  console.log(`${slug}: price=${out[slug].price} entries=${entries.length} sum=${entries.reduce((a,e)=>a+e.chance,0)}`);
}

fs.writeFileSync('scripts/curated-cases-extracted.json', JSON.stringify(out, null, 2));
console.log('Wrote scripts/curated-cases-extracted.json');
