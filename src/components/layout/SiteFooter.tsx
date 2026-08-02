import { DISCORD_INVITE_URL } from '../../lib/discordUrl';
import { navigateCookiePolicy, navigatePrivacyPolicy, navigateProvablyFair, navigateTermsOfService } from '../../lib/appRoute';
import { NAV_ITEMS, navigateNavItem } from '../../lib/navItems';
import { scrollToPageTop } from '../../lib/scrollToSection';

const GAME_NAV_IDS = new Set(['cases', 'upgrades', 'case-battle', 'giveaways', 'free-cases']);

function runFooterNavAction(action: () => void): void {
  action();
  window.setTimeout(() => scrollToPageTop(), 0);
}

function DiscordLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

interface Props {
  registeredUsers: number;
}

export function SiteFooter({ registeredUsers }: Props) {
  const gameItems = NAV_ITEMS.filter(item => GAME_NAV_IDS.has(item.id) && item.available);
  const userCount =
    typeof registeredUsers === 'number' && Number.isFinite(registeredUsers)
      ? registeredUsers
      : 0;

  return (
    <footer className="mt-6 w-full shrink-0 border-t border-white/8 bg-[#0a0812]">
      <div className="mx-auto max-w-[1920px] px-4 py-8 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] lg:items-start lg:gap-10 xl:gap-12">
          <div>
            <h2 className="font-display text-xl font-bold tracking-[0.12em] uppercase text-white">
              Blox<span className="text-gold">Upgrader</span>
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-win shadow-[0_0_8px_rgba(0,230,118,0.65)]" />
              <span className="font-display text-lg font-semibold tabular-nums text-win">
                {userCount.toLocaleString('en-US')}
              </span>
              <span className="text-sm font-medium text-white/45">users registered</span>
            </div>
          </div>

          <div>
            <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
              Games
            </h3>
            <ul className="mt-3 space-y-2">
              {gameItems.map(item => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => runFooterNavAction(() => navigateNavItem(item))}
                    className="font-display text-sm font-medium text-white/55 transition hover:text-white"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
              Legal
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => runFooterNavAction(navigateTermsOfService)}
                  className="font-display text-sm font-medium text-white/55 transition hover:text-white"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => runFooterNavAction(navigatePrivacyPolicy)}
                  className="font-display text-sm font-medium text-white/55 transition hover:text-white"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => runFooterNavAction(navigateCookiePolicy)}
                  className="font-display text-sm font-medium text-white/55 transition hover:text-white"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => runFooterNavAction(navigateProvablyFair)}
                  className="font-display text-sm font-medium text-white/55 transition hover:text-white"
                >
                  Provably Fair
                </button>
              </li>
            </ul>
          </div>

          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="font-display text-[11px] font-bold uppercase tracking-[0.14em] text-white/35">
              Social
            </h3>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Join our Discord"
              className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/65 transition hover:border-[#5865F2]/45 hover:bg-[#5865F2]/15 hover:text-[#7289DA] hover:shadow-[0_0_16px_rgba(88,101,242,0.25)]"
            >
              <DiscordLogo />
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-4">
          <p className="text-center font-display text-[11px] font-medium uppercase tracking-wider text-white/25">
            © {new Date().getFullYear()} BloxUpgrader.com — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
