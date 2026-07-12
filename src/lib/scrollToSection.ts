export function getAppScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-scroll-root]');
}

export function scrollToPageTop(): void {
  const root = getAppScrollRoot();
  if (root) {
    root.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToSectionById(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (!element) return;

  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
