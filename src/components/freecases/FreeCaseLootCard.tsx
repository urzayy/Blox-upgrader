import { RARITY, type Skin } from '../../data/skins';
import { SkinImage } from '../skins/SkinImage';

function splitSkinName(name: string): { weapon: string; skin: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weapon: parts[0], skin: parts.slice(1).join(' | ') };
  }
  return { weapon: name, skin: '' };
}

interface Props {
  skin: Skin;
  compact?: boolean;
}

export function FreeCaseLootCard({ skin, compact }: Props) {
  const r = RARITY[skin.rarity];
  const { weapon, skin: skinName } = splitSkinName(skin.name);

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-md border border-white/[0.06] bg-[#12101c] ${
        compact ? 'w-[88px]' : 'w-[104px] sm:w-[112px]'
      }`}
      style={{ boxShadow: `inset 0 -3px 0 ${r.color}` }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{ background: `radial-gradient(circle at 50% 28%, ${r.color}, transparent 72%)` }}
      />

      <span className="absolute left-1.5 top-1.5 z-10 font-mono text-[8px] font-bold tracking-tighter text-white/25">
        /////
      </span>

      <div className={`relative mx-auto ${compact ? 'h-[72px]' : 'h-[84px] sm:h-[92px]'} px-1 pt-4`}>
        <SkinImage src={skin.image} alt={skin.name} zoom={1.12} />
      </div>

      <div className="relative border-t border-white/[0.05] bg-[#0a0812]/90 px-1.5 py-1.5">
        <p className="truncate text-[9px] font-semibold text-white/75">{weapon}</p>
        {skinName && (
          <p className="truncate text-[9px] font-bold text-white/90">{skinName}</p>
        )}
      </div>
    </div>
  );
}
