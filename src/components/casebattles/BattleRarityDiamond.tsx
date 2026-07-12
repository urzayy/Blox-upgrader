import type { Skin } from '../../data/skins';

import { RARITY } from '../../data/skins';



function skinRarityAccent(skin: Skin) {

  const isKnife = skin.weapon === 'Knife' || skin.weapon === 'Gloves';

  return isKnife ? RARITY.extraordinary : RARITY[skin.rarity];

}



interface Props {

  skin?: Skin | null;

  size?: 'hero' | 'mini' | 'reel';

  leadDrop?: boolean;

  className?: string;

}



/** Tall rounded rhombus — small fill + glowing stroke (CaseHug / paint ref). */

const RHOMBUS_PATH =

  'M50 1 C76 28, 99 42, 99 60 C99 78, 76 92, 50 119 C24 92, 1 78, 1 60 C1 42, 24 28, 50 1 Z';



const DIAMOND_WIDTH: Record<'hero' | 'mini' | 'reel', string> = {
  hero: 'w-[17%]',
  reel: 'w-[17%]',
  mini: 'w-[25%]',
};



function RarityRhombus({

  color,

  glow,

  fillOpacity = 0.16,

  strokeWidth = 2,

  className = '',

}: {

  color: string;

  glow?: string;

  fillOpacity?: number;

  strokeWidth?: number;

  className?: string;

}) {

  const glowColor = glow ?? color;



  return (

    <div

      className={`pointer-events-none absolute left-1/2 top-1/2 aspect-[5/6] -translate-x-1/2 -translate-y-1/2 ${className}`}

    >

      <svg

        className="h-full w-full"

        viewBox="0 0 100 120"

        fill="none"

        preserveAspectRatio="xMidYMid meet"

        aria-hidden="true"

      >

        <path

          d={RHOMBUS_PATH}

          fill={glowColor}

          fillOpacity={fillOpacity * 0.55}

          stroke="none"

          style={{ filter: 'blur(8px)' }}

        />

        <path

          d={RHOMBUS_PATH}

          fill={color}

          fillOpacity={fillOpacity}

          stroke={color}

          strokeWidth={strokeWidth}

          strokeOpacity={0.92}

          style={{

            filter: `drop-shadow(0 0 10px ${glowColor}cc) drop-shadow(0 0 4px ${glowColor}99)`,

          }}

        />

      </svg>

    </div>

  );

}



export function BattleRarityDiamond({ skin, size = 'hero', leadDrop = false, className = '' }: Props) {

  const widthClass = DIAMOND_WIDTH[size];

  const accent = skin ? skinRarityAccent(skin) : null;



  if (leadDrop && accent) {

    return (

      <RarityRhombus

        color="#84cc16"

        glow="#a3e635"

        fillOpacity={0.2}

        strokeWidth={2.2}

        className={`${widthClass} ${className}`}

      />

    );

  }



  if (!accent) {

    return (

      <RarityRhombus

        color="rgba(255,255,255,0.35)"

        glow="rgba(255,255,255,0.2)"

        fillOpacity={0.08}

        strokeWidth={1.5}

        className={`${widthClass} ${className}`}

      />

    );

  }



  return (

    <RarityRhombus

      color={accent.color}

      glow={accent.glow}

      fillOpacity={0.18}

      strokeWidth={2}

      className={`${widthClass} ${className}`}

    />

  );

}



export { skinRarityAccent };


