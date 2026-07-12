export interface ProfilePhotoRecord {
  userId: string;
  dataUrl: string;
  updatedAt: number;
}

export async function fetchProfilePhoto(userId: string): Promise<ProfilePhotoRecord | null> {
  try {
    const res = await fetch(`/api/profile-photo?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json() as { photo?: ProfilePhotoRecord | null };
    return data.photo ?? null;
  } catch {
    return null;
  }
}

export async function uploadProfilePhoto(
  userId: string,
  email: string,
  dataUrl: string,
): Promise<{ ok: boolean; error?: string; photo?: ProfilePhotoRecord }> {
  try {
    const res = await fetch('/api/profile-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email, dataUrl }),
    });
    const data = await res.json().catch(() => ({})) as {
      ok?: boolean;
      error?: string;
      photo?: ProfilePhotoRecord;
      message?: string;
    };
    if (!res.ok) {
      return { ok: false, error: data.message ?? data.error ?? 'Could not upload photo.' };
    }
    return { ok: true, photo: data.photo };
  } catch {
    return { ok: false, error: 'Could not connect to server.' };
  }
}

export async function resizeImageFile(file: File, maxSize = 256): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image_failed'));
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas_failed');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.88);
}
