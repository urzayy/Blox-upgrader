import type { ReactNode } from 'react';
import type { BattleListTab, BattleMode } from '../../lib/caseBattles';

interface Props {
  tab: BattleListTab;
  onTabChange: (tab: BattleListTab) => void;
  modeFilter: BattleMode | 'all';
  onModeFilterChange: (mode: BattleMode | 'all') => void;
  affordableOnly: boolean;
  onAffordableChange: (value: boolean) => void;
  onCreateBattle: () => void;
}

function ModeFilterButton({
  active,
  label,
  className,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  className: string;
  onClick: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-2 font-display text-[11px] font-black uppercase tracking-[0.1em] transition ${
        active ? className : 'bg-[#171a22] text-white/45 hover:bg-[#1f2430] hover:text-white/70'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export function CaseBattlesToolbar({
  tab,
  onTabChange,
  modeFilter,
  onModeFilterChange,
  affordableOnly,
  onAffordableChange,
  onCreateBattle,
}: Props) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/[0.06] px-3 py-3 sm:px-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onTabChange('active')}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 font-display text-[11px] font-black uppercase tracking-[0.12em] transition ${
            tab === 'active'
              ? 'bg-[#1c1830] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
              : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
          }`}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm-.75 1.5h1.5v2.25H10V8H8.75v2.25h-1.5V8H5.5V6.75H7.25V5.25Z" />
          </svg>
          Active
        </button>

        <button
          type="button"
          onClick={() => onTabChange('my-battles')}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2 font-display text-[11px] font-black uppercase tracking-[0.12em] transition ${
            tab === 'my-battles'
              ? 'bg-[#1c1830] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
              : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
          }`}
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 5.5c0-2.21 2.24-4 5-4s5 1.79 5 4v.5H3v-.5Z" />
          </svg>
          My Battles
        </button>

        <div className="hidden h-6 w-px bg-white/10 lg:block" aria-hidden="true" />

        <div className="flex flex-wrap items-center gap-1.5">
          <ModeFilterButton
            active={modeFilter === 'classic'}
            label="Classic"
            className="bg-lime-400 text-[#10140f]"
            onClick={() => onModeFilterChange(modeFilter === 'classic' ? 'all' : 'classic')}
            icon={
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M8 1.5 9.8 5.2h4.1l-3.3 2.4 1.3 4L8 10.1 4.1 11.6l1.3-4L2.1 5.2h4.1L8 1.5Z" />
              </svg>
            }
          />
          <ModeFilterButton
            active={modeFilter === 'underdog'}
            label="Underdog"
            className="bg-violet-500 text-white"
            onClick={() => onModeFilterChange(modeFilter === 'underdog' ? 'all' : 'underdog')}
            icon={
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M3 8c0-1.2.8-2.2 2-2.6V4.5h1.5v.9c1.2.4 2 1.4 2 2.6 0 .7-.3 1.3-.7 1.8l2.2 2.2-1.1 1.1-2.2-2.2c-.5.4-1.1.7-1.8.7-1.7 0-3-1.3-3-3Zm6.5 0c0-1.2.8-2.2 2-2.6V4.5H13v.9c1.2.4 2 1.4 2 2.6 0 .7-.3 1.3-.7 1.8l2.2 2.2-1.1 1.1-2.2-2.2c-.5.4-1.1.7-1.8.7-1.7 0-3-1.3-3-3Z" />
              </svg>
            }
          />
          <ModeFilterButton
            active={modeFilter === 'share'}
            label="Share"
            className="bg-sky-500 text-white"
            onClick={() => onModeFilterChange(modeFilter === 'share' ? 'all' : 'share')}
            icon={
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
                <path d="M11 2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM5 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM6.7 7.6l2.6-1.2M6.7 8.4l2.6 1.2M9.3 4.8l-2.6 1.2M9.3 11.2l-2.6-1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              </svg>
            }
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
        <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#171a22] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/55">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white/35" fill="currentColor" aria-hidden="true">
            <path d="M2 4.5h12v7H2v-7Zm1.5 1.5v4h9v-4h-9Z" />
          </svg>
          <span>Affordable</span>
          <button
            type="button"
            role="switch"
            aria-checked={affordableOnly}
            onClick={() => onAffordableChange(!affordableOnly)}
            className={`relative h-6 w-11 rounded-full transition ${
              affordableOnly ? 'bg-violet-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                affordableOnly ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </label>

        <button
          type="button"
          onClick={onCreateBattle}
          className="inline-flex items-center gap-2 rounded-md bg-lime-400 px-4 py-2.5 font-display text-[11px] font-black uppercase tracking-[0.12em] text-[#10140f] transition hover:bg-lime-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded bg-[#10140f]/10">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              <path d="M4 12 8 4l1.8 3.6L12 7.2 10.2 12H4Zm8-1.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
            </svg>
          </span>
          + Create Battle
        </button>
      </div>
    </div>
  );
}
