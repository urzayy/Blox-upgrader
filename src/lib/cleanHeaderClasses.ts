/** SkinClub-inspired purple header shell — localhost dev layout only. */

export const CLEAN_HEADER_BG = 'bg-[#100d1a]/98';

export const CLEAN_HEADER_BORDER = 'border-violet-500/10';



/** Shared chip style for Live Chats, Saldo, profile, etc. */

export function cleanHeaderChip(active = false): string {

  return active

    ? 'border-violet-500/25 bg-[#1a1530] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'

    : 'border-violet-500/10 bg-[#141024] text-white/65 hover:border-violet-500/20 hover:bg-[#1a1530] hover:text-white/85';

}



export function cleanHeaderShell(extra = ''): string {

  return [

    'min-h-[76px]',

    CLEAN_HEADER_BG,

    CLEAN_HEADER_BORDER,

    'px-6 lg:px-10',

    'py-3.5',

    'shadow-[0_4px_28px_rgba(0,0,0,0.45)]',

    extra,

  ].join(' ');

}

