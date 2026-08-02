import fs from 'node:fs';
import path from 'node:path';

export const CREATOR_EMAIL = 'urzay1v1@gmail.com';

const DEFAULT_ADMINS = [CREATOR_EMAIL, 'ecruzcastillo2009@gmail.com'];

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createAdminEmailsStore(stateDir) {
  if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir, { recursive: true });

  const filePath = path.join(stateDir, 'admins.json');

  function loadRaw() {
    if (!fs.existsSync(filePath)) {
      const initial = { emails: [...DEFAULT_ADMINS], updatedAt: Date.now() };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const emails = Array.isArray(parsed.emails)
        ? parsed.emails.map(normalizeEmail).filter(isValidEmail)
        : [];
      const withCreator = new Set([CREATOR_EMAIL, ...emails]);
      return {
        emails: [...withCreator],
        updatedAt: Number(parsed.updatedAt ?? Date.now()),
      };
    } catch {
      const initial = { emails: [...DEFAULT_ADMINS], updatedAt: Date.now() };
      fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
  }

  function saveEmails(emails) {
    const normalized = [...new Set([CREATOR_EMAIL, ...emails.map(normalizeEmail).filter(isValidEmail)])];
    const payload = { emails: normalized, updatedAt: Date.now() };
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
    return payload;
  }

  function listAdmins() {
    return loadRaw().emails.slice().sort((a, b) => a.localeCompare(b));
  }

  function isCreatorEmail(email) {
    return normalizeEmail(email) === CREATOR_EMAIL;
  }

  function isAdminEmail(email) {
    const normalized = normalizeEmail(email);
    return listAdmins().includes(normalized);
  }

  function assertCreator(creatorEmail) {
    if (!isCreatorEmail(creatorEmail)) {
      throw new Error('Only the creator can manage administrators');
    }
  }

  function addAdmin(creatorEmail, newEmail) {
    assertCreator(creatorEmail);
    const normalized = normalizeEmail(newEmail);
    if (!isValidEmail(normalized)) {
      throw new Error('Invalid email address');
    }
    const current = listAdmins();
    if (current.includes(normalized)) {
      return { added: false, emails: current };
    }
    const saved = saveEmails([...current, normalized]);
    return { added: true, emails: saved.emails };
  }

  function removeAdmin(creatorEmail, targetEmail) {
    assertCreator(creatorEmail);
    const normalized = normalizeEmail(targetEmail);
    if (normalized === CREATOR_EMAIL) {
      throw new Error('Cannot remove the creator account');
    }
    const current = listAdmins();
    if (!current.includes(normalized)) {
      return { removed: false, emails: current };
    }
    const saved = saveEmails(current.filter(email => email !== normalized));
    return { removed: true, emails: saved.emails };
  }

  return {
    CREATOR_EMAIL,
    listAdmins,
    isCreatorEmail,
    isAdminEmail,
    addAdmin,
    removeAdmin,
  };
}
