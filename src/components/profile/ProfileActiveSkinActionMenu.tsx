import type { ReactNode } from 'react';
import type { Skin } from '../../data/skins';
import { formatSkinObtained, getSkinObtainedAt } from '../../lib/skinObtainedAt';
import { CoinPrice } from '../ui/CoinPrice';

interface Props {
  skin: Skin;
  locked?: boolean;
  visible?: boolean;
  onClose?: () => void;
  onSell: (skin: Skin) => void;
  onUpgrade: (skin: Skin) => void;
  onWithdraw: (skin: Skin) => void;
}

function ActionRow({
  icon,
  label,
  trailing,
  accent,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  label: ReactNode;
  trailing?: ReactNode;
  accent?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={e => {
        e.stopPropagation();
        if (!disabled) onClick();
      }}
      className={`flex w-full items-center gap-3 border-b border-white/10 px-3 py-2.5 text-left transition last:border-b-0 ${
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'bg-[#141024]/95 hover:bg-[#181d2b]'
      }`}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#1e2433] text-white">
        {icon}
      </span>
      <span className={`min-w-0 flex-1 text-[12px] font-semibold ${accent ? 'text-win' : 'text-white'}`}>
        {label}
      </span>
      {trailing}
    </button>
  );
}

export function ProfileActiveSkinActionMenu({
  skin,
  locked,
  visible,
  onClose,
  onSell,
  onUpgrade,
  onWithdraw,
}: Props) {
  const obtainedAt = getSkinObtainedAt(skin);
  const obtained = obtainedAt ? formatSkinObtained(obtainedAt) : null;

  return (
    <div
      className={`absolute inset-0 z-30 flex flex-col overflow-hidden rounded-lg border border-white/20 bg-[#0c0a14] shadow-[0_12px_40px_rgba(0,0,0,0.75)] transition-opacity duration-200 ${
        visible
          ? 'opacity-100'
          : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-white/10 bg-[#141024] px-3 py-2.5">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-white/50">Obtained</p>
          <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-white">BloxUpgrader</p>
        </div>
        {obtained ? (
          <div className="text-right">
            <p className="text-[11px] font-semibold tabular-nums text-white">{obtained.time}</p>
            <p className="mt-0.5 text-[10px] tabular-nums text-white/60">{obtained.date}</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-[10px] text-white/35">—</p>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col bg-[#0c0a14]">
        <ActionRow
          disabled={locked}
          icon={<span className="text-[13px] font-bold">$</span>}
          label={(
            <>
              Sell for{' '}
              <CoinPrice
                value={skin.price}
                iconClassName="inline h-3 w-3 align-[-2px]"
                textClassName="text-[12px] font-bold text-win"
              />
            </>
          )}
          onClick={() => {
            onSell(skin);
            onClose?.();
          }}
        />
        <ActionRow
          disabled={locked}
          icon={(
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path d="M8 12V4M8 4L5 7M8 4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          label="Upgrade"
          onClick={() => {
            onUpgrade(skin);
            onClose?.();
          }}
        />
        <ActionRow
          disabled={locked}
          accent
          icon={(
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
              <path d="M11 5.5 8.5 3M11 5.5 8.5 8M11 5.5H5.5a2 2 0 0 0-2 2V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 10.5 7.5 13M5 10.5 7.5 8M5 10.5h5.5a2 2 0 0 0 2-2V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          label="Withdraw"
          onClick={() => {
            onWithdraw(skin);
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}
