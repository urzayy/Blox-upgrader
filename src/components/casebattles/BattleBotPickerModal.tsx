import { botShortName, type BattleBotDefinition } from '../../lib/caseBattleBots';

interface Props {
  open: boolean;
  bots: BattleBotDefinition[];
  onClose: () => void;
  onSelect: (bot: BattleBotDefinition) => void;
}

export function BattleBotPickerModal({ open, bots, onClose, onSelect }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/75 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#12101c] shadow-[0_24px_80px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-display text-sm font-black uppercase tracking-[0.12em] text-white">
            Select bot
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-white/45 transition hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {bots.length === 0 ? (
            <p className="px-3 py-10 text-center font-display text-xs font-bold uppercase tracking-[0.12em] text-white/35">
              No bots available
            </p>
          ) : (
            bots.map(bot => (
              <button
                key={bot.id}
                type="button"
                onClick={() => {
                  onSelect(bot);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-white/[0.04]"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#12101c] font-display text-sm font-black text-white"
                  style={{ backgroundColor: bot.avatarUrl ? '#12101c' : bot.color }}
                >
                  {bot.avatarUrl ? (
                    <img src={bot.avatarUrl} alt="" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    botShortName(bot.name).slice(0, 1)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-1.5 py-0.5 font-display text-[9px] font-black uppercase text-white"
                      style={{ backgroundColor: bot.badgeColor }}
                    >
                      Bot
                    </span>
                    <span className="truncate font-display text-sm font-black text-white">
                      {botShortName(bot.name)}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
