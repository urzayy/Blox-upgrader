import { DISCORD_INVITE_URL } from '../../lib/discordUrl';

function DiscordLogo({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface Props {
  className?: string;
  variant?: 'compact' | 'menu';
}

export function DiscordLinkButton({ className = '', variant = 'compact' }: Props) {
  if (variant === 'menu') {
    return (
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`group flex min-h-[52px] w-full items-center gap-3 rounded-xl border border-transparent bg-transparent px-3 py-3 text-left transition hover:border-[#5865F2]/30 hover:bg-[#5865F2]/10 ${className}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#5865F2]/25 bg-gradient-to-br from-[#5865F2] to-[#4752C4] text-white group-hover:border-[#5865F2]/45">
          <DiscordLogo className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-sm font-bold uppercase tracking-wide text-white/75 group-hover:text-white">
            Discord
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-white/35 group-hover:text-white/50">
            Join our official community
          </span>
        </span>
      </a>
    );
  }

  return (
    <a
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Join our Discord"
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border border-[#5865F2]/50 bg-gradient-to-r from-[#5865F2] to-[#4752C4] px-2 py-1.5 font-display text-[9px] font-bold uppercase tracking-wide text-white shadow-[0_0_10px_rgba(88,101,242,0.25)] transition hover:border-[#7289DA]/70 hover:from-[#7289DA] hover:to-[#5865F2] hover:shadow-[0_0_16px_rgba(88,101,242,0.4)] ${className}`}
    >
      <DiscordLogo className="h-3 w-3" />
      <span>Discord</span>
    </a>
  );
}
