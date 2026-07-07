import fs from 'node:fs';
import path from 'node:path';
import { normalizeBonusCode } from './depositBonus.mjs';

const CODE_PATTERN = /^[A-Z0-9_-]{3,24}$/;

function isEntry(value) {
  return (
    value
    && typeof value.code === 'string'
    && typeof value.percent === 'number'
    && typeof value.createdAt === 'number'
    && typeof value.createdBy === 'string'
    && (value.expiresAt === null || typeof value.expiresAt === 'number')
  );
}

export function createPromoCodeStore(promoCodesDir) {
  const filePath = path.join(promoCodesDir, 'codes.json');

  function ensureDir() {
    if (!fs.existsSync(promoCodesDir)) fs.mkdirSync(promoCodesDir, { recursive: true });
  }

  function loadAll() {
    ensureDir();
    if (!fs.existsSync(filePath)) {
      const initial = { codes: [] };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!Array.isArray(parsed?.codes)) return { codes: [] };
      return { codes: parsed.codes.filter(isEntry) };
    } catch {
      return { codes: [] };
    }
  }

  function saveAll(data) {
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  function isActive(entry, now = Date.now()) {
    return entry.expiresAt == null || entry.expiresAt > now;
  }

  function validateCode(code, now = Date.now()) {
    const normalized = normalizeBonusCode(code);
    if (!normalized) {
      return { valid: false, percent: 0, error: 'Enter a code.' };
    }

    const entry = loadAll().codes.find(item => item.code === normalized);
    if (!entry) {
      return { valid: false, percent: 0, error: 'Invalid code.' };
    }
    if (!isActive(entry, now)) {
      return { valid: false, percent: 0, error: 'This code has expired.' };
    }

    return { valid: true, percent: entry.percent };
  }

  function listCodes(now = Date.now()) {
    return loadAll().codes
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(entry => ({
        ...entry,
        active: isActive(entry, now),
      }));
  }

  function createCode({ code, percent, durationValue, durationUnit, createdBy }) {
    const normalized = normalizeBonusCode(code);
    if (!CODE_PATTERN.test(normalized)) {
      return { error: 'Code must be 3–24 characters (letters, numbers, _ or -).' };
    }
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100 || !Number.isInteger(percent)) {
      return { error: 'Bonus percent must be a whole number from 1 to 100.' };
    }

    const data = loadAll();
    if (data.codes.some(item => item.code === normalized)) {
      return { error: 'That code already exists.' };
    }

    let expiresAt = null;
    if (durationUnit !== 'permanent') {
      const value = Number(durationValue);
      if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) {
        return { error: 'Enter a valid duration.' };
      }
      const ms = durationUnit === 'days'
        ? value * 24 * 60 * 60 * 1000
        : value * 60 * 60 * 1000;
      expiresAt = Date.now() + ms;
    }

    const entry = {
      code: normalized,
      percent,
      expiresAt,
      createdAt: Date.now(),
      createdBy: String(createdBy ?? '').trim().toLowerCase(),
    };
    data.codes.push(entry);
    saveAll(data);
    return { entry: { ...entry, active: true } };
  }

  function deleteCode(code) {
    const normalized = normalizeBonusCode(code);
    if (!normalized) {
      return { error: 'Enter a code.' };
    }

    const data = loadAll();
    const index = data.codes.findIndex(item => item.code === normalized);
    if (index < 0) {
      return { error: 'Code not found.' };
    }

    const [removed] = data.codes.splice(index, 1);
    saveAll(data);
    return { entry: removed };
  }

  return {
    validateCode,
    listCodes,
    createCode,
    deleteCode,
  };
}
