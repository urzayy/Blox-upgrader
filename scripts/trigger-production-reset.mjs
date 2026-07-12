import dotenv from 'dotenv';

dotenv.config();

const siteUrl = (process.env.SITE_URL || 'https://bloxupgrader.com').replace(/\/$/, '');
const adminEmail = (process.env.ADMIN_EMAIL || 'urzay1v1@gmail.com').trim().toLowerCase();

async function main() {
  const res = await fetch(`${siteUrl}/api/admin/reset-all-progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminEmail }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? data.error ?? `HTTP ${res.status}`);
  }

  console.log(JSON.stringify({ siteUrl, ...data }, null, 2));
}

main().catch((error) => {
  console.error('[trigger-production-reset]', error);
  process.exit(1);
});
