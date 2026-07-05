import type { ReactNode } from 'react';

interface IconProps {
  className?: string;
}

export function KnifeTabIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5 14 10l-1.2-1.2 6.5-6.5 1.2 1.2ZM6.8 17.2l-3.3 3.3 1.4 1.4 3.3-3.3 4.9-4.9-1.4-1.4-4.9 4.9Zm2.1-8.4 1.4 1.4 7.8-7.8-1.4-1.4-7.8 7.8Z" />
    </svg>
  );
}

export function ShopTabIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M4 10V20h16V10H4Zm2 2h2v6H6v-6Zm4 0h2v6h-2v-6Zm4 0h2v6h-2v-6ZM5 8l1.5-4h11L19 8H5Z" />
    </svg>
  );
}

export function CartIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM7.16 14h9.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 21.05 5H6.21L5.27 3H2v2h2l3.6 7.59-1.35 2.44C5.52 15.37 6.48 17 7.16 14Z" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12ZM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4Z" />
    </svg>
  );
}

interface TabButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}

export function PanelTabButton({ active, label, onClick, children }: TabButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
        active
          ? 'border-gold/50 bg-gold/20 text-gold shadow-[0_0_16px_rgba(255,215,0,0.28)]'
          : 'border-white/10 bg-[#141820] text-white/45 hover:border-white/25 hover:text-white/75'
      }`}
    >
      {children}
    </button>
  );
}
