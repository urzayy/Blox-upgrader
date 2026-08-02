const html = await fetch('https://bloxupgrader.com/', { cache: 'no-store' }).then((r) => r.text());

const lang = html.match(/html lang="([^"]+)"/)?.[1];
const ogImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
const twitterCards = [...html.matchAll(/name="twitter:card" content="([^"]+)"/g)].map((m) => m[1]);
const description = html.match(/name="description" content="([^"]+)"/)?.[1];
const robots = html.match(/name="robots" content="([^"]+)"/)?.[1];

const ok =
  lang === 'en' &&
  ogImage === 'https://bloxupgrader.com/banner-social.jpg' &&
  twitterCards.length === 1 &&
  twitterCards[0] === 'summary_large_image' &&
  description?.includes('premium CS2 skin upgrade platform') &&
  robots === 'index, follow';

console.log(JSON.stringify({ lang, ogImage, twitterCards, description, robots, ok }, null, 2));
process.exit(ok ? 0 : 1);
