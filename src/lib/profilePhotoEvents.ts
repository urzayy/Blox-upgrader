type Listener = () => void;

const listeners = new Set<Listener>();

export function notifyProfilePhotoUpdated(): void {
  for (const listener of listeners) listener();
}

export function subscribeProfilePhotoUpdated(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
