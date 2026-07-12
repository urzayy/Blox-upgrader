import { RARITY, type Skin } from '../../data/skins';
import { CoinPrice } from '../ui/CoinPrice';
import { SkinImage } from '../skins/SkinImage';

function wearShort(wear: string): string {
  const map: Record<string, string> = {
    'Factory New': 'FN',
    'Minimal Wear': 'MW',
    'Field-Tested': 'FT',
    'Well-Worn': 'WW',
    'Battle-Scarred': 'BS',
  };
  return map[wear] ?? wear.slice(0, 2).toUpperCase();
}

function splitSkinName(name: string): { weapon: string; skin: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weapon: parts[0], skin: parts.slice(1).join(' | ') };
  }
  return { weapon: name, skin: '' };
}

function BattleDropCard({ skin, compact = false }: { skin: Skin; compact?: boolean }) {
  const rarity = RARITY[skin.rarity];
  const { weapon, skin: skinName } = splitSkinName(skin.name);

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-white/[0.08] bg-[#141824]"
      style={{ boxShadow: `inset 0 -2px 0 ${rarity.color}55` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ background: `radial-gradient(circle at 50% 30%, ${rarity.color}, transparent 70%)` }}
      />

      <span className="absolute left-1 top-1 z-10 rounded bg-black/55 px-1 py-0.5 font-mono text-[8px] font-bold tracking-tight text-white/55">
        {wearShort(skin.wear)}
      </span>

      <div className={`relative mx-auto px-1 pt-4 ${compact ? 'h-[4.5rem]' : 'h-[6.5rem] pt-5 sm:h-[7.5rem]'}`}>
        <SkinImage src={skin.image} alt={skin.name} zoom={compact ? 1 : 1.15} />
      </div>

      <div className="relative border-t border-white/[0.06] bg-[#0d1018]/95 px-1.5 py-1 sm:px-2 sm:py-1.5">
        <p className={`truncate font-display font-bold leading-tight ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
          <span className="text-white/80">{weapon}</span>
          {skinName ? (
            <>
              {' '}
              <span className="font-black" style={{ color: rarity.color }}>
                {skinName}
              </span>
            </>
          ) : null}
          {' '}
          <CoinPrice
            value={skin.price}
            className="inline-flex align-middle"
            textClassName={`font-display font-black text-white/55 ${compact ? 'text-[8px]' : 'text-[10px]'}`}
            iconClassName={compact ? 'h-2 w-2 opacity-70' : 'h-2.5 w-2.5 opacity-70'}
          />
        </p>
      </div>
    </div>
  );
}

interface Props {
  skins: Skin[];
  className?: string;
  compact?: boolean;
}

export function BattleDropGrid({ skins, className = '', compact = false }: Props) {
  if (!skins.length) return null;

  return (
    <div className={`mt-1.5 grid gap-1 sm:gap-1.5 ${compact ? 'grid-cols-2' : 'grid-cols-2 gap-1.5 sm:gap-2'} ${className}`}>
      {skins.map((skin, index) => (
        <BattleDropCard key={`${skin.id}-${index}`} skin={skin} compact={compact} />
      ))}
    </div>
  );
}
