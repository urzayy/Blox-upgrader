import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function normalizeAnnouncement(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!raw.active) return null;
  const id = typeof raw.id === 'string' ? raw.id.trim() : '';
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  const createdAt = typeof raw.createdAt === 'number' ? raw.createdAt : null;
  const createdBy = typeof raw.createdBy === 'string' ? raw.createdBy.trim() : '';
  if (!id || !title || !message || createdAt == null) return null;
  return { id, title, message, createdAt, createdBy, active: true };
}

export function createAnnouncementStore(announcementsDir) {
  const filePath = path.join(announcementsDir, 'active.json');

  function ensureDir() {
    if (!fs.existsSync(announcementsDir)) fs.mkdirSync(announcementsDir, { recursive: true });
  }

  function readFile() {
    ensureDir();
    if (!fs.existsSync(filePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return null;
    }
  }

  function getActive() {
    return normalizeAnnouncement(readFile());
  }

  function publish({ title, message, createdBy }) {
    const normalizedTitle = String(title ?? '').trim().slice(0, 120);
    const normalizedMessage = String(message ?? '').trim().slice(0, 2000);
    const normalizedCreatedBy = String(createdBy ?? '').trim();
    if (!normalizedTitle || !normalizedMessage) {
      return { error: 'title_and_message_required' };
    }

    const announcement = {
      id: crypto.randomUUID(),
      title: normalizedTitle,
      message: normalizedMessage,
      createdAt: Date.now(),
      createdBy: normalizedCreatedBy,
      active: true,
    };

    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(announcement, null, 2), 'utf8');
    return { announcement };
  }

  function clear() {
    ensureDir();
    const current = readFile();
    if (current && typeof current === 'object') {
      fs.writeFileSync(
        filePath,
        JSON.stringify({ ...current, active: false, clearedAt: Date.now() }, null, 2),
        'utf8',
      );
    }
    return { ok: true };
  }

  return { getActive, publish, clear };
}
