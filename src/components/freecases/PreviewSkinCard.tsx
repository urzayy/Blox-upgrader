import { RARITY } from '../../data/skins';
import type { Skin } from '../../data/skins';
import { isRoyalLootChance } from '../../lib/freeCaseRoyal';
import { RoyalCrownBadge } from './RoyalCrownBadge';
import { SkinImage } from '../skins/SkinImage';

function splitSkinName(name: string): { weapon: string; skin: string } {
  const parts = name.split('|').map(part => part.trim());
  if (parts.length >= 2) {
    return { weapon: parts[0], skin: parts.slice(1).join(' | ') };
  }
  return { weapon: name, skin: '' };
}

function rarityCardBackground(color: string, isKnife: boolean): string {
  if (isKnife) {
    return 'linear-gradient(180deg, rgba(255,215,0,0.22) 0%, rgba(180,130,20,0.55) 42%, rgba(60,45,8,0.95) 100%)';
  }
  return `linear-gradient(180deg, color-mix(in srgb, ${color} 22%, #14101f) 0%, color-mix(in srgb, ${color} 48%, #100d18) 46%, color-mix(in srgb, ${color} 30%, #080610) 100%)`;
}

interface Props {
  skin: Skin;
  chance?: number;
  /** Outer cards on each side are slightly smaller/dimmer. */
  edge?: boolean;
}

export function PreviewSkinCard({ skin, chance, edge = false }: Props) {
  const r = RARITY[skin.rarity];
  const isKnife = skin.weapon === 'Knife' || skin.weapon === 'Gloves';
  const accent = isKnife ? '#ffd700' : r.color;
  const { weapon, skin: skinName } = splitSkinName(skin.name);
  const displayWeapon = isKnife && !weapon.startsWith('★') ? `★ ${weapon}` : weapon;
  const isRoyal = chance != null && isRoyalLootChance(chance);

  return (
    <article
      className={`relative shrink-0 overflow-hidden rounded-lg border border-white/[0.06] transition ${
        edge ? 'scale-[0.92] opacity-70' : 'scale-100 opacity-100'
      }`}
      style={{
        width: edge ? 128 : 140,
        height: edge ? 156 : 170,
        background: rarityCardBackground(accent, isKnife),
        boxShadow: edge ? undefined : `inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px -10px rgba(0,0,0,0.65)`,
      }}
    >
      {isRoyal && <RoyalCrownBadge />}
      <div
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% 18%, ${accent}, transparent 70%)`,
        }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex justify-center pt-1">
          <span className="font-mono text-[8px] font-bold tracking-tighter text-white/20" aria-hidden="true">
            ////
          </span>
        </div>

        <div className="relative mx-auto flex h-[72px] w-[72%] items-center justify-center px-1 sm:h-[78px]">
          <SkinImage src={skin.image} alt={skin.name} zoom={0.94} />
        </div>

        <div className="relative mt-auto px-2 pb-2 text-center">
          <p className="truncate text-[8px] font-medium leading-tight text-white/75 sm:text-[9px]">{displayWeapon}</p>
          {skinName && (
            <p className="truncate text-[9px] font-bold leading-tight sm:text-[10px]" style={{ color: accent }}>
              {skinName}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
