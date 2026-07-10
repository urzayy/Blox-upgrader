export type RarityKey =
  | 'consumer'
  | 'industrial'
  | 'milspec'
  | 'restricted'
  | 'classified'
  | 'covert'
  | 'extraordinary';

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  rarity: RarityKey;
  wear: string;
  price: number;
  image: string;
  obtainedAt?: number;
}

export interface FeedItem {
  id: string;
  username: string;
  inputSkin: string;
  targetSkin: string;
  inputImage?: string;
  targetImage?: string;
  probability: number;
  won: boolean;
  timestamp: number;
}

export const RARITY: Record<RarityKey, { label: string; color: string; glow: string }> = {
  consumer: { label: 'Consumer', color: '#b0c3d9', glow: 'rgba(176,195,217,0.35)' },
  industrial: { label: 'Industrial', color: '#5e98d9', glow: 'rgba(94,152,217,0.35)' },
  milspec: { label: 'Mil-Spec', color: '#4b69ff', glow: 'rgba(75,105,255,0.4)' },
  restricted: { label: 'Restricted', color: '#8847ff', glow: 'rgba(136,71,255,0.45)' },
  classified: { label: 'Classified', color: '#d32ce6', glow: 'rgba(211,44,230,0.45)' },
  covert: { label: 'Covert', color: '#eb4b4b', glow: 'rgba(235,75,75,0.5)' },
  extraordinary: { label: 'Extraordinary', color: '#ffd700', glow: 'rgba(255,215,0,0.55)' },
};

export function sortSkinsByPriceDesc(skins: Skin[]): Skin[] {
  return [...skins].sort((a, b) => {
    const byPrice = Number(b.price) - Number(a.price);
    if (byPrice !== 0) return byPrice;
    return a.name.localeCompare(b.name, 'es');
  });
}

/** Bloxstrike catalog — 290 skins, sorted by price desc */
const SKIN_CATALOG: Skin[] = [
  { id: 'skin_001_karambit_frostbite', name: 'Karambit | Frostbite', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 139000, image: 'https://bloxstrike.net/items/bloxstrike-live/79761341183165.png' },
  { id: 'skin_002_karambit_noir', name: 'Karambit | Noir', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 100000, image: 'https://bloxstrike.net/items/bloxstrike-live/131209897519753.png' },
  { id: 'skin_003_flip_aurora', name: 'Flip | Aurora', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 71100, image: 'https://bloxstrike.net/items/bloxstrike-live/128576804864738.png' },
  { id: 'skin_004_flip_frostbite', name: 'Flip | Frostbite', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 59700, image: 'https://bloxstrike.net/items/bloxstrike-live/138793965073702.png' },
  { id: 'skin_005_gut_noir', name: 'Gut | Noir', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 28400, image: 'https://bloxstrike.net/items/bloxstrike-live/98358735156670.png' },
  { id: 'skin_006_gut_aurora', name: 'Gut | Aurora', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 24700, image: 'https://bloxstrike.net/items/bloxstrike-live/121640032706759.png' },
  { id: 'skin_007_gut_frostbite', name: 'Gut | Frostbite', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 21800, image: 'https://bloxstrike.net/items/bloxstrike-live/104711840445578.png' },
  { id: 'skin_008_stiletto_safari', name: 'Stiletto | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 20900, image: 'https://bloxstrike.net/items/bloxstrike-live/128389123015241.png' },
  { id: 'skin_009_karambit_fade', name: 'Karambit | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 20300, image: 'https://bloxstrike.net/items/bloxstrike-live/74368007102644.png' },
  { id: 'skin_010_karambit_tiger_stripes', name: 'Karambit | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 18000, image: 'https://bloxstrike.net/items/bloxstrike-live/95211024718206.png' },
  { id: 'skin_011_karambit_aurora', name: 'Karambit | Aurora', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 15000, image: 'https://bloxstrike.net/items/bloxstrike-live/138413413100500.png' },
  { id: 'skin_012_butterfly_fade', name: 'Butterfly | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 14300, image: 'https://bloxstrike.net/items/bloxstrike-live/106697835426931.png' },
  { id: 'skin_013_butterfly_tiger_stripes', name: 'Butterfly | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 14100, image: 'https://bloxstrike.net/items/bloxstrike-live/82145293216243.png' },
  { id: 'skin_014_bayonet_fade', name: 'Bayonet | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 12300, image: 'https://bloxstrike.net/items/bloxstrike-live/80595388025959.png' },
  { id: 'skin_015_sports_gloves_imperial', name: 'Sports Gloves | Imperial', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 12000, image: 'https://bloxstrike.net/items/bloxstrike-live/75665163318076.png' },
  { id: 'skin_016_bayonet_tiger_stripes', name: 'Bayonet | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 11100, image: 'https://bloxstrike.net/items/bloxstrike-live/70463036776846.png' },
  { id: 'skin_017_sports_gloves_malibu', name: 'Sports Gloves | Malibu', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 10700, image: 'https://bloxstrike.net/items/bloxstrike-live/101305569158677.png' },
  { id: 'skin_018_stiletto_violet', name: 'Stiletto | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 10500, image: 'https://bloxstrike.net/items/bloxstrike-live/87519753219275.png' },
  { id: 'skin_019_karambit_scarlet', name: 'Karambit | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 10500, image: 'https://bloxstrike.net/items/bloxstrike-live/93160113970136.png' },
  { id: 'skin_020_bayonet_scarlet', name: 'Bayonet | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 9880, image: 'https://bloxstrike.net/items/bloxstrike-live/73019270186108.png' },
  { id: 'skin_021_skeleton_fade', name: 'Skeleton | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 9610, image: 'https://bloxstrike.net/items/bloxstrike-live/116910956316790.png' },
  { id: 'skin_022_karambit_vanilla', name: 'Karambit | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 9140, image: 'https://bloxstrike.net/items/bloxstrike-live/102495712966985.png' },
  { id: 'skin_023_butterfly_scarlet', name: 'Butterfly | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 9000, image: 'https://bloxstrike.net/items/bloxstrike-live/125882948964404.png' },
  { id: 'skin_024_operator_gloves_fade', name: 'Operator Gloves | Fade', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 8800, image: 'https://bloxstrike.net/items/bloxstrike-live/110019397326515.png' },
  { id: 'skin_025_karambit_damascus', name: 'Karambit | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 7940, image: 'https://bloxstrike.net/items/bloxstrike-live/91543369886040.png' },
  { id: 'skin_026_butterfly_damascus', name: 'Butterfly | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 7300, image: 'https://bloxstrike.net/items/bloxstrike-live/109109777074306.png' },
  { id: 'skin_027_sports_gloves_tidal', name: 'Sports Gloves | Tidal', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 6990, image: 'https://bloxstrike.net/items/bloxstrike-live/79809682082551.png' },
  { id: 'skin_028_karambit_rusted', name: 'Karambit | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6880, image: 'https://bloxstrike.net/items/bloxstrike-live/82199230769656.png' },
  { id: 'skin_029_karambit_blackwidow', name: 'Karambit | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6770, image: 'https://bloxstrike.net/items/bloxstrike-live/136778199973384.png' },
  { id: 'skin_030_stiletto_tiger_stripes', name: 'Stiletto | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6590, image: 'https://bloxstrike.net/items/bloxstrike-live/73060066712564.png' },
  { id: 'skin_031_flip_fade', name: 'Flip | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6460, image: 'https://bloxstrike.net/items/bloxstrike-live/122890588562444.png' },
  { id: 'skin_032_operator_gloves_black_widow', name: 'Operator Gloves | Black Widow', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 6220, image: 'https://bloxstrike.net/items/bloxstrike-live/84048948308515.png' },
  { id: 'skin_033_flip_tiger_stripes', name: 'Flip | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6110, image: 'https://bloxstrike.net/items/bloxstrike-live/122568248922963.png' },
  { id: 'skin_034_skeleton_scarlet', name: 'Skeleton | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 6090, image: 'https://bloxstrike.net/items/bloxstrike-live/82177594283467.png' },
  { id: 'skin_035_sports_gloves_labyrinth', name: 'Sports Gloves | Labyrinth', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 6080, image: 'https://bloxstrike.net/items/bloxstrike-live/109212398466944.png' },
  { id: 'skin_036_karambit_violet', name: 'Karambit | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 5870, image: 'https://bloxstrike.net/items/bloxstrike-live/139129013572542.png' },
  { id: 'skin_037_operator_gloves_hellwire', name: 'Operator Gloves | Hellwire', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 5610, image: 'https://bloxstrike.net/items/bloxstrike-live/79263996275288.png' },
  { id: 'skin_038_sports_gloves_racer', name: 'Sports Gloves | Racer', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 5420, image: 'https://bloxstrike.net/items/bloxstrike-live/114643071471160.png' },
  { id: 'skin_039_awp_beta', name: 'AWP | Beta', weapon: 'AWP', rarity: 'extraordinary', wear: 'Field-Tested', price: 5130, image: 'https://bloxstrike.net/items/bloxstrike-live/124416502090313.png' },
  { id: 'skin_040_butterfly_vanilla', name: 'Butterfly | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 5120, image: 'https://bloxstrike.net/items/bloxstrike-live/78588429271427.png' },
  { id: 'skin_041_stiletto_blackwidow', name: 'Stiletto | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 5000, image: 'https://bloxstrike.net/items/bloxstrike-live/129449718166052.png' },
  { id: 'skin_042_butterfly_rusted', name: 'Butterfly | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4930, image: 'https://bloxstrike.net/items/bloxstrike-live/130942303823779.png' },
  { id: 'skin_043_bayonet_damascus', name: 'Bayonet | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4760, image: 'https://bloxstrike.net/items/bloxstrike-live/115080076019472.png' },
  { id: 'skin_044_flip_scarlet', name: 'Flip | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4760, image: 'https://bloxstrike.net/items/bloxstrike-live/135381813993407.png' },
  { id: 'skin_045_karambit_doodle', name: 'Karambit | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4590, image: 'https://bloxstrike.net/items/bloxstrike-live/120730938583742.png' },
  { id: 'skin_046_butterfly_doodle', name: 'Butterfly | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4530, image: 'https://bloxstrike.net/items/bloxstrike-live/102865152153231.png' },
  { id: 'skin_047_karambit_whiteout', name: 'Karambit | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4500, image: 'https://bloxstrike.net/items/bloxstrike-live/114301226895128.png' },
  { id: 'skin_048_karambit_naval', name: 'Karambit | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4490, image: 'https://bloxstrike.net/items/bloxstrike-live/76387784625729.png' },
  { id: 'skin_049_karambit_midnight', name: 'Karambit | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4460, image: 'https://bloxstrike.net/items/bloxstrike-live/84343241127839.png' },
  { id: 'skin_050_bayonet_vanilla', name: 'Bayonet | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4300, image: 'https://bloxstrike.net/items/bloxstrike-live/124824778019343.png' },
  { id: 'skin_051_karambit_woodland', name: 'Karambit | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4240, image: 'https://bloxstrike.net/items/bloxstrike-live/110826146970814.png' },
  { id: 'skin_052_driver_gloves_snow_leopard', name: 'Driver Gloves | Snow Leopard', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 4210, image: 'https://bloxstrike.net/items/bloxstrike-live/133957542310311.png' },
  { id: 'skin_053_karambit_safari', name: 'Karambit | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4180, image: 'https://bloxstrike.net/items/bloxstrike-live/93690634411905.png' },
  { id: 'skin_054_operator_gloves_emerald_widow', name: 'Operator Gloves | Emerald Widow', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 4090, image: 'https://bloxstrike.net/items/bloxstrike-live/93323651655129.png' },
  { id: 'skin_055_flip_damascus', name: 'Flip | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4050, image: 'https://bloxstrike.net/items/bloxstrike-live/75547079494434.png' },
  { id: 'skin_056_skeleton_vanilla', name: 'Skeleton | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 4040, image: 'https://bloxstrike.net/items/bloxstrike-live/87507678545290.png' },
  { id: 'skin_057_gut_fade', name: 'Gut | Fade', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3950, image: 'https://bloxstrike.net/items/bloxstrike-live/95275570528896.png' },
  { id: 'skin_058_bayonet_rusted', name: 'Bayonet | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3930, image: 'https://bloxstrike.net/items/bloxstrike-live/139932715629570.png' },
  { id: 'skin_059_sports_gloves_freshmint', name: 'Sports Gloves | Freshmint', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3930, image: 'https://bloxstrike.net/items/bloxstrike-live/127608450845755.png' },
  { id: 'skin_060_bayonet_blackwidow', name: 'Bayonet | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3900, image: 'https://bloxstrike.net/items/bloxstrike-live/90806456943659.png' },
  { id: 'skin_061_sports_gloves_bumblebee', name: 'Sports Gloves | Bumblebee', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3760, image: 'https://bloxstrike.net/items/bloxstrike-live/116732891350636.png' },
  { id: 'skin_062_hand_wraps_bandage', name: 'Hand Wraps | Bandage', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3750, image: 'https://bloxstrike.net/items/bloxstrike-live/102250051983579.png' },
  { id: 'skin_063_package_m4a1_s_anodized_red', name: 'Package | M4A1-S | Anodized Red', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 3730, image: 'https://bloxstrike.net/items/bloxstrike-live/96193690360774.png' },
  { id: 'skin_064_sports_gloves_blackout', name: 'Sports Gloves | Blackout', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3670, image: 'https://bloxstrike.net/items/bloxstrike-live/131525089627267.png' },
  { id: 'skin_065_bayonet_violet', name: 'Bayonet | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3670, image: 'https://bloxstrike.net/items/bloxstrike-live/129718786201649.png' },
  { id: 'skin_066_hand_wraps_aztec', name: 'Hand Wraps | Aztec', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3600, image: 'https://bloxstrike.net/items/bloxstrike-live/90350865435356.png' },
  { id: 'skin_067_bayonet_naval', name: 'Bayonet | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3470, image: 'https://bloxstrike.net/items/bloxstrike-live/95969897826010.png' },
  { id: 'skin_068_operator_gloves_reinforced', name: 'Operator Gloves | Reinforced', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3460, image: 'https://bloxstrike.net/items/bloxstrike-live/123073579676420.png' },
  { id: 'skin_069_hand_wraps_meander', name: 'Hand Wraps | Meander', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3400, image: 'https://bloxstrike.net/items/bloxstrike-live/78613308215975.png' },
  { id: 'skin_070_gut_tiger_stripes', name: 'Gut | Tiger Stripes', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3350, image: 'https://bloxstrike.net/items/bloxstrike-live/84654052342165.png' },
  { id: 'skin_071_bayonet_whiteout', name: 'Bayonet | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3260, image: 'https://bloxstrike.net/items/bloxstrike-live/107157746622142.png' },
  { id: 'skin_072_operator_gloves_smoke', name: 'Operator Gloves | Smoke', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3250, image: 'https://bloxstrike.net/items/bloxstrike-live/108536789406170.png' },
  { id: 'skin_073_butterfly_violet', name: 'Butterfly | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3240, image: 'https://bloxstrike.net/items/bloxstrike-live/114857309297352.png' },
  { id: 'skin_074_operator_gloves_bumblebee', name: 'Operator Gloves | Bumblebee', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3230, image: 'https://bloxstrike.net/items/bloxstrike-live/82742140649629.png' },
  { id: 'skin_075_bayonet_doodle', name: 'Bayonet | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3170, image: 'https://bloxstrike.net/items/bloxstrike-live/125715390726858.png' },
  { id: 'skin_076_stiletto_vanilla', name: 'Stiletto | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3170, image: 'https://bloxstrike.net/items/bloxstrike-live/99687107676025.png' },
  { id: 'skin_077_butterfly_naval', name: 'Butterfly | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3150, image: 'https://bloxstrike.net/items/bloxstrike-live/111900993940951.png' },
  { id: 'skin_078_butterfly_woodland', name: 'Butterfly | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3130, image: 'https://bloxstrike.net/items/bloxstrike-live/78162582750708.png' },
  { id: 'skin_079_skeleton_blackwidow', name: 'Skeleton | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3020, image: 'https://bloxstrike.net/items/bloxstrike-live/122466107044644.png' },
  { id: 'skin_080_driver_gloves_cobra', name: 'Driver Gloves | Cobra', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 3010, image: 'https://bloxstrike.net/items/bloxstrike-live/98732847945986.png' },
  { id: 'skin_081_butterfly_midnight', name: 'Butterfly | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 3000, image: 'https://bloxstrike.net/items/bloxstrike-live/82497240178553.png' },
  { id: 'skin_082_butterfly_whiteout', name: 'Butterfly | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2970, image: 'https://bloxstrike.net/items/bloxstrike-live/139796292927038.png' },
  { id: 'skin_083_skeleton_whiteout', name: 'Skeleton | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2960, image: 'https://bloxstrike.net/items/bloxstrike-live/73687896541270.png' },
  { id: 'skin_084_bayonet_midnight', name: 'Bayonet | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2890, image: 'https://bloxstrike.net/items/bloxstrike-live/134444035831656.png' },
  { id: 'skin_085_butterfly_safari', name: 'Butterfly | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2880, image: 'https://bloxstrike.net/items/bloxstrike-live/135033903539257.png' },
  { id: 'skin_086_bayonet_safari', name: 'Bayonet | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2840, image: 'https://bloxstrike.net/items/bloxstrike-live/85604205934442.png' },
  { id: 'skin_087_driver_gloves_cardinal', name: 'Driver Gloves | Cardinal', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2820, image: 'https://bloxstrike.net/items/bloxstrike-live/90697963761030.png' },
  { id: 'skin_088_skeleton_naval', name: 'Skeleton | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2800, image: 'https://bloxstrike.net/items/bloxstrike-live/117336493532955.png' },
  { id: 'skin_089_gut_scarlet', name: 'Gut | Scarlet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2800, image: 'https://bloxstrike.net/items/bloxstrike-live/106791821145854.png' },
  { id: 'skin_090_stiletto_doodle', name: 'Stiletto | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2740, image: 'https://bloxstrike.net/items/bloxstrike-live/80165507327550.png' },
  { id: 'skin_091_flip_blackwidow', name: 'Flip | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2720, image: 'https://bloxstrike.net/items/bloxstrike-live/111788837058048.png' },
  { id: 'skin_092_stiletto_damascus', name: 'Stiletto | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2700, image: 'https://bloxstrike.net/items/bloxstrike-live/127468787069985.png' },
  { id: 'skin_093_hand_wraps_crime_scene', name: 'Hand Wraps | Crime Scene', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2700, image: 'https://bloxstrike.net/items/bloxstrike-live/103301070341086.png' },
  { id: 'skin_094_operator_gloves_agent', name: 'Operator Gloves | Agent', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2660, image: 'https://bloxstrike.net/items/bloxstrike-live/72181517504912.png' },
  { id: 'skin_095_skeleton_violet', name: 'Skeleton | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2650, image: 'https://bloxstrike.net/items/bloxstrike-live/122826325708875.png' },
  { id: 'skin_096_driver_gloves_leopard', name: 'Driver Gloves | Leopard', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2650, image: 'https://bloxstrike.net/items/bloxstrike-live/133362686135410.png' },
  { id: 'skin_097_stiletto_woodland', name: 'Stiletto | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2630, image: 'https://bloxstrike.net/items/bloxstrike-live/128823555948958.png' },
  { id: 'skin_098_flip_vanilla', name: 'Flip | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2550, image: 'https://bloxstrike.net/items/bloxstrike-live/115788195540060.png' },
  { id: 'skin_099_gut_damascus', name: 'Gut | Damascus', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2510, image: 'https://bloxstrike.net/items/bloxstrike-live/101745563237771.png' },
  { id: 'skin_100_skeleton_safari', name: 'Skeleton | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2500, image: 'https://bloxstrike.net/items/bloxstrike-live/88859869862052.png' },
  { id: 'skin_101_operator_gloves_amber_fade', name: 'Operator Gloves | Amber Fade', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2480, image: 'https://bloxstrike.net/items/bloxstrike-live/91028038958284.png' },
  { id: 'skin_102_stiletto_midnight', name: 'Stiletto | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2400, image: 'https://bloxstrike.net/items/bloxstrike-live/70369357875598.png' },
  { id: 'skin_103_skeleton_midnight', name: 'Skeleton | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2330, image: 'https://bloxstrike.net/items/bloxstrike-live/122095354596020.png' },
  { id: 'skin_104_sports_gloves_dune', name: 'Sports Gloves | Dune', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2320, image: 'https://bloxstrike.net/items/bloxstrike-live/99569571925114.png' },
  { id: 'skin_105_flip_doodle', name: 'Flip | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2290, image: 'https://bloxstrike.net/items/bloxstrike-live/86327515769889.png' },
  { id: 'skin_106_flip_rusted', name: 'Flip | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2290, image: 'https://bloxstrike.net/items/bloxstrike-live/127398374106324.png' },
  { id: 'skin_107_package_aug_anodized_red', name: 'Package | AUG | Anodized Red', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 2260, image: 'https://bloxstrike.net/items/bloxstrike-live/80921195030451.png' },
  { id: 'skin_108_driver_gloves_cardinal_weave', name: 'Driver Gloves | Cardinal Weave', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2250, image: 'https://bloxstrike.net/items/bloxstrike-live/101623638654811.png' },
  { id: 'skin_109_flip_naval', name: 'Flip | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2250, image: 'https://bloxstrike.net/items/bloxstrike-live/107121758345982.png' },
  { id: 'skin_110_flip_midnight', name: 'Flip | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2230, image: 'https://bloxstrike.net/items/bloxstrike-live/96364895911319.png' },
  { id: 'skin_111_flip_whiteout', name: 'Flip | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2210, image: 'https://bloxstrike.net/items/bloxstrike-live/125533978118469.png' },
  { id: 'skin_112_bayonet_woodland', name: 'Bayonet | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2200, image: 'https://bloxstrike.net/items/bloxstrike-live/112899170359698.png' },
  { id: 'skin_113_stiletto_rusted', name: 'Stiletto | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2200, image: 'https://bloxstrike.net/items/bloxstrike-live/122991082916872.png' },
  { id: 'skin_114_driver_gloves_tuxedo', name: 'Driver Gloves | Tuxedo', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2160, image: 'https://bloxstrike.net/items/bloxstrike-live/131023745601676.png' },
  { id: 'skin_115_flip_woodland', name: 'Flip | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2130, image: 'https://bloxstrike.net/items/bloxstrike-live/79355399305691.png' },
  { id: 'skin_116_sports_gloves_hunter', name: 'Sports Gloves | Hunter', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 2040, image: 'https://bloxstrike.net/items/bloxstrike-live/125152079647129.png' },
  { id: 'skin_117_gut_vanilla', name: 'Gut | Vanilla', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2040, image: 'https://bloxstrike.net/items/bloxstrike-live/74506801768392.png' },
  { id: 'skin_118_flip_safari', name: 'Flip | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2040, image: 'https://bloxstrike.net/items/bloxstrike-live/97682388773446.png' },
  { id: 'skin_119_package_desert_eagle_high_octane', name: 'Package | Desert Eagle | High Octane', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 2000, image: 'https://bloxstrike.net/items/bloxstrike-live/116837871910630.png' },
  { id: 'skin_120_skeleton_woodland', name: 'Skeleton | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2000, image: 'https://bloxstrike.net/items/bloxstrike-live/74055280257361.png' },
  { id: 'skin_121_flip_violet', name: 'Flip | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 2000, image: 'https://bloxstrike.net/items/bloxstrike-live/110253575097439.png' },
  { id: 'skin_122_awp_metamorphosis', name: 'AWP | Metamorphosis', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 1990, image: 'https://bloxstrike.net/items/bloxstrike-live/117963786318378.png' },
  { id: 'skin_123_driver_gloves_nomad', name: 'Driver Gloves | Nomad', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1970, image: 'https://bloxstrike.net/items/bloxstrike-live/74064691716201.png' },
  { id: 'skin_124_gut_doodle', name: 'Gut | Doodle', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1890, image: 'https://bloxstrike.net/items/bloxstrike-live/122235395836024.png' },
  { id: 'skin_125_package_awp_high_octane', name: 'Package | AWP | High Octane', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 1850, image: 'https://bloxstrike.net/items/bloxstrike-live/125260742023537.png' },
  { id: 'skin_126_gut_blackwidow', name: 'Gut | Blackwidow', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1840, image: 'https://bloxstrike.net/items/bloxstrike-live/136907689255627.png' },
  { id: 'skin_127_gut_violet', name: 'Gut | Violet', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1820, image: 'https://bloxstrike.net/items/bloxstrike-live/127558628138118.png' },
  { id: 'skin_128_driver_gloves_gator', name: 'Driver Gloves | Gator', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1820, image: 'https://bloxstrike.net/items/bloxstrike-live/100906379437261.png' },
  { id: 'skin_129_gut_whiteout', name: 'Gut | Whiteout', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1790, image: 'https://bloxstrike.net/items/bloxstrike-live/72559787453342.png' },
  { id: 'skin_130_gut_naval', name: 'Gut | Naval', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1750, image: 'https://bloxstrike.net/items/bloxstrike-live/140460587804154.png' },
  { id: 'skin_131_driver_gloves_tartan', name: 'Driver Gloves | Tartan', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1740, image: 'https://bloxstrike.net/items/bloxstrike-live/87090405850366.png' },
  { id: 'skin_132_hand_wraps_snakeskin', name: 'Hand Wraps | Snakeskin', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1670, image: 'https://bloxstrike.net/items/bloxstrike-live/110189976157643.png' },
  { id: 'skin_133_gut_midnight', name: 'Gut | Midnight', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1650, image: 'https://bloxstrike.net/items/bloxstrike-live/131381753965014.png' },
  { id: 'skin_134_operator_gloves_hunter', name: 'Operator Gloves | Hunter', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1640, image: 'https://bloxstrike.net/items/bloxstrike-live/81779093546713.png' },
  { id: 'skin_135_driver_gloves_midnight_weave', name: 'Driver Gloves | Midnight Weave', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1640, image: 'https://bloxstrike.net/items/bloxstrike-live/79682883857169.png' },
  { id: 'skin_136_hand_wraps_taped', name: 'Hand Wraps | Taped', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1620, image: 'https://bloxstrike.net/items/bloxstrike-live/128091165481921.png' },
  { id: 'skin_137_gut_safari', name: 'Gut | Safari', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1590, image: 'https://bloxstrike.net/items/bloxstrike-live/122026707214371.png' },
  { id: 'skin_138_hand_wraps_camouflage', name: 'Hand Wraps | Camouflage', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1550, image: 'https://bloxstrike.net/items/bloxstrike-live/80289047803085.png' },
  { id: 'skin_139_hand_wraps_checkers', name: 'Hand Wraps | Checkers', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1520, image: 'https://bloxstrike.net/items/bloxstrike-live/70918561887392.png' },
  { id: 'skin_140_gut_rusted', name: 'Gut | Rusted', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1490, image: 'https://bloxstrike.net/items/bloxstrike-live/85270959203020.png' },
  { id: 'skin_141_package_mp_9_anodized_red', name: 'Package | MP-9 | Anodized Red', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 1440, image: 'https://bloxstrike.net/items/bloxstrike-live/94406276254599.png' },
  { id: 'skin_142_gut_woodland', name: 'Gut | Woodland', weapon: 'Knife', rarity: 'extraordinary', wear: 'Field-Tested', price: 1400, image: 'https://bloxstrike.net/items/bloxstrike-live/79124912599935.png' },
  { id: 'skin_143_hand_wraps_hunter', name: 'Hand Wraps | Hunter', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1360, image: 'https://bloxstrike.net/items/bloxstrike-live/121877212650460.png' },
  { id: 'skin_144_hand_wraps_carpet', name: 'Hand Wraps | Carpet', weapon: 'Gloves', rarity: 'extraordinary', wear: 'Field-Tested', price: 1320, image: 'https://bloxstrike.net/items/bloxstrike-live/116465088725763.png' },
  { id: 'skin_145_m4a1_s_anodized_red', name: 'M4A1-S | Anodized Red', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 1100, image: 'https://bloxstrike.net/items/bloxstrike-live/87908365282079.png' },
  { id: 'skin_146_package_mp9_high_octane', name: 'Package | MP9 | High Octane', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 1040, image: 'https://bloxstrike.net/items/bloxstrike-live/115824013489426.png' },
  { id: 'skin_147_package_ak_47_midas', name: 'Package | AK-47 | Midas', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 1010, image: 'https://bloxstrike.net/items/bloxstrike-live/75177355895881.png' },
  { id: 'skin_148_package_tec_9_medal_tv', name: 'Package | Tec-9 | Medal.tv', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 1000, image: 'https://bloxstrike.net/items/bloxstrike-live/71231444746781.png' },
  { id: 'skin_149_flip_noir', name: 'Flip | Noir', weapon: 'Knife', rarity: 'covert', wear: 'Field-Tested', price: 22000, image: 'https://bloxstrike.net/items/bloxstrike-live/84089827338039.png' },
  { id: 'skin_150_package_awp_tekko', name: 'Package | AWP | Tekko', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 960, image: 'https://bloxstrike.net/items/bloxstrike-live/120743455064046.png' },
  { id: 'skin_151_awp_high_octane', name: 'AWP | High Octane', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 953, image: 'https://bloxstrike.net/items/bloxstrike-live/136112070369501.png' },
  { id: 'skin_152_package_m4a4_tekko', name: 'Package | M4A4 | Tekko', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 811, image: 'https://bloxstrike.net/items/bloxstrike-live/91269532200879.png' },
  { id: 'skin_153_glock_18_aurora', name: 'Glock-18 | Aurora', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 758, image: 'https://bloxstrike.net/items/bloxstrike-live/119347012284483.png' },
  { id: 'skin_154_package_usp_s_tekko', name: 'Package | USP-S | Tekko', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 729, image: 'https://bloxstrike.net/items/bloxstrike-live/131381283338953.png' },
  { id: 'skin_155_package_ak_47_pinpoint', name: 'Package | AK-47 | PinPoint', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 726, image: 'https://bloxstrike.net/items/bloxstrike-live/113325057646529.png' },
  { id: 'skin_156_desert_eagle_high_octane', name: 'Desert Eagle | High Octane', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 631, image: 'https://bloxstrike.net/items/bloxstrike-live/94846790071504.png' },
  { id: 'skin_157_m4a1_s_phaseprint', name: 'M4A1-S | Phaseprint', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 320, image: 'https://bloxstrike.net/items/bloxstrike-live/76878278285757.png' },
  { id: 'skin_158_ak_47_sakura', name: 'AK-47 | Sakura', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 505, image: 'https://bloxstrike.net/items/bloxstrike-live/118393450198241.png' },
  { id: 'skin_159_awp_tekko', name: 'AWP | Tekko', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 487, image: 'https://bloxstrike.net/items/bloxstrike-live/122798764244612.png' },
  { id: 'skin_160_ak_47_luminex', name: 'AK-47 | Luminex', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 473, image: 'https://bloxstrike.net/items/bloxstrike-live/91575659979849.png' },
  { id: 'skin_161_awp_overdrive', name: 'AWP | Overdrive', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 427, image: 'https://bloxstrike.net/items/bloxstrike-live/103061547931238.png' },
  { id: 'skin_162_ak_47_pinpoint', name: 'AK-47 | PinPoint', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 420, image: 'https://bloxstrike.net/items/bloxstrike-live/78237429638206.png' },
  { id: 'skin_163_ak_47_midas', name: 'AK-47 | Midas', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 416, image: 'https://bloxstrike.net/items/bloxstrike-live/126943923949394.png' },
  { id: 'skin_164_m4a1_s_supersoaked', name: 'M4A1-S | SuperSoaked', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 409, image: 'https://bloxstrike.net/items/bloxstrike-live/108863433712503.png' },
  { id: 'skin_165_mp9_anodized_red', name: 'MP9 | Anodized Red', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 400, image: 'https://bloxstrike.net/items/bloxstrike-live/100809950300989.png' },
  { id: 'skin_166_aug_anodized_red', name: 'AUG | Anodized Red', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 376, image: 'https://bloxstrike.net/items/bloxstrike-live/84350880711844.png' },
  { id: 'skin_167_m4a4_tekko', name: 'M4A4 | Tekko', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 376, image: 'https://bloxstrike.net/items/bloxstrike-live/135220557479517.png' },
  { id: 'skin_168_package_glock_18_midas', name: 'Package | Glock-18 | Midas', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 351, image: 'https://bloxstrike.net/items/bloxstrike-live/126726654780672.png' },
  { id: 'skin_169_usp_s_tekko', name: 'USP-S | Tekko', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 350, image: 'https://bloxstrike.net/items/bloxstrike-live/136544769697340.png' },
  { id: 'skin_170_package_p90_pinpoint', name: 'Package | P90 | PinPoint', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 343, image: 'https://bloxstrike.net/items/bloxstrike-live/107098462562379.png' },
  { id: 'skin_171_famas_heirloom', name: 'FAMAS | Heirloom', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 337, image: 'https://bloxstrike.net/items/bloxstrike-live/81459830277649.png' },
  { id: 'skin_172_package_glock_18_pinpoint', name: 'Package | Glock-18 | PinPoint', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 332, image: 'https://bloxstrike.net/items/bloxstrike-live/123337456221339.png' },
  { id: 'skin_173_awp_bird_hunt', name: 'AWP | Bird Hunt', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 304, image: 'https://bloxstrike.net/items/bloxstrike-live/91355488643704.png' },
  { id: 'skin_174_mp9_high_octane', name: 'MP9 | High Octane', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 303, image: 'https://bloxstrike.net/items/bloxstrike-live/99133552349769.png' },
  { id: 'skin_175_usp_s_supersoaked', name: 'USP-S | SuperSoaked', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 285, image: 'https://bloxstrike.net/items/bloxstrike-live/111928584115671.png' },
  { id: 'skin_176_package_mac_10_midas', name: 'Package | MAC-10 | Midas', weapon: 'Package', rarity: 'covert', wear: 'Field-Tested', price: 247, image: 'https://bloxstrike.net/items/bloxstrike-live/87600573919459.png' },
  { id: 'skin_177_m4a1_s_retro', name: 'M4A1-S | Retro', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 206, image: 'https://bloxstrike.net/items/bloxstrike-live/127638017774749.png' },
  { id: 'skin_178_sawed_off_supersoaked', name: 'Sawed-Off | SuperSoaked', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 147, image: 'https://bloxstrike.net/items/bloxstrike-live/92355344149162.png' },
  { id: 'skin_179_m4a1_s_orchids', name: 'M4A1-S | Orchids', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 141, image: 'https://bloxstrike.net/items/bloxstrike-live/118636080343193.png' },
  { id: 'skin_180_glock_18_pinpoint', name: 'Glock-18 | PinPoint', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 120, image: 'https://bloxstrike.net/items/bloxstrike-live/120890001687679.png' },
  { id: 'skin_181_m4a4_b_hop', name: 'M4A4 | B-Hop', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 106, image: 'https://bloxstrike.net/items/bloxstrike-live/112285612049344.png' },
  { id: 'skin_182_p90_pinpoint', name: 'P90 | PinPoint', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 101, image: 'https://bloxstrike.net/items/bloxstrike-live/105293566332593.png' },
  { id: 'skin_183_mp9_x_ray', name: 'MP9 | X-Ray', weapon: 'SMG', rarity: 'classified', wear: 'Field-Tested', price: 100, image: 'https://bloxstrike.net/items/bloxstrike-live/128454411389675.png' },
  { id: 'skin_184_desert_eagle_permafrost', name: 'Desert Eagle | Permafrost', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 85, image: 'https://bloxstrike.net/items/bloxstrike-live/119477576365240.png' },
  { id: 'skin_185_awp_typhon', name: 'AWP | Typhon', weapon: 'AWP', rarity: 'classified', wear: 'Field-Tested', price: 40, image: 'https://bloxstrike.net/items/bloxstrike-live/136191452368563.png' },
  { id: 'skin_186_famas_mind', name: 'FAMAS | Mind', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 71, image: 'https://bloxstrike.net/items/bloxstrike-live/73737345526334.png' },
  { id: 'skin_187_m4a4_bubblepop', name: 'M4A4 | BubblePop', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 67, image: 'https://bloxstrike.net/items/bloxstrike-live/132505793750527.png' },
  { id: 'skin_188_galil_ar_irid', name: 'Galil AR | Irid', weapon: 'Rifle', rarity: 'covert', wear: 'Field-Tested', price: 65, image: 'https://bloxstrike.net/items/bloxstrike-live/131127067601241.png' },
  { id: 'skin_189_p90_chromatic', name: 'P90 | Chromatic', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 56, image: 'https://bloxstrike.net/items/bloxstrike-live/97233491835732.png' },
  { id: 'skin_190_ssg_08_onyx', name: 'SSG 08 | Onyx', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 51, image: 'https://bloxstrike.net/items/bloxstrike-live/81009006872507.png' },
  { id: 'skin_191_tec_9_medal_tv', name: 'Tec-9 | Medal.tv', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 51, image: 'https://bloxstrike.net/items/bloxstrike-live/129652986787950.png' },
  { id: 'skin_192_glock_18_midas', name: 'Glock-18 | Midas', weapon: 'Pistol', rarity: 'covert', wear: 'Field-Tested', price: 50, image: 'https://bloxstrike.net/items/bloxstrike-live/75696586761696.png' },
  { id: 'skin_193_awp_railgun', name: 'AWP | Railgun', weapon: 'AWP', rarity: 'classified', wear: 'Field-Tested', price: 48, image: 'https://bloxstrike.net/items/bloxstrike-live/124999883032205.png' },
  { id: 'skin_194_ssg_08_mindspill', name: 'SSG 08 | Mindspill', weapon: 'AWP', rarity: 'covert', wear: 'Field-Tested', price: 48, image: 'https://bloxstrike.net/items/bloxstrike-live/76518146707378.png' },
  { id: 'skin_195_case_finishline_case', name: 'Case | Finishline Case', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 47, image: 'https://bloxstrike.net/items/bloxstrike-live/114958333422119.png' },
  { id: 'skin_196_case_lionheart', name: 'Case | Lionheart', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 47, image: 'https://bloxstrike.net/items/bloxstrike-live/73482740280871.png' },
  { id: 'skin_197_case_glove_case_2', name: 'Case | Glove Case 2', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 46, image: 'https://bloxstrike.net/items/bloxstrike-live/75374128985311.png' },
  { id: 'skin_198_case_glove_case', name: 'Case | Glove Case', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 45, image: 'https://bloxstrike.net/items/bloxstrike-live/123594181073716.png' },
  { id: 'skin_199_usp_s_ajax', name: 'USP-S | Ajax', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 45, image: 'https://bloxstrike.net/items/bloxstrike-live/128789343995926.png' },
  { id: 'skin_200_m4a4_ignition', name: 'M4A4 | Ignition', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 43, image: 'https://bloxstrike.net/items/bloxstrike-live/72363970187101.png' },
  { id: 'skin_201_case_case_1', name: 'Case | Case #1', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 42, image: 'https://bloxstrike.net/items/bloxstrike-live/103053431273169.png' },
  { id: 'skin_202_case_chrysalis', name: 'Case | Chrysalis', weapon: 'Case', rarity: 'covert', wear: 'Field-Tested', price: 42, image: 'https://bloxstrike.net/items/bloxstrike-live/134467311250667.png' },
  { id: 'skin_203_p90_drft', name: 'P90 | DRFT', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 42, image: 'https://bloxstrike.net/items/bloxstrike-live/129912585396630.png' },
  { id: 'skin_204_desert_eagle_mercy', name: 'Desert Eagle | Mercy', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 37, image: 'https://bloxstrike.net/items/bloxstrike-live/88607588222034.png' },
  { id: 'skin_205_glock_18_fade', name: 'Glock-18 | Fade', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 37, image: 'https://bloxstrike.net/items/bloxstrike-live/102311740531470.png' },
  { id: 'skin_206_m4a1_s_castroil', name: 'M4A1-S | Castroil', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 180, image: 'https://bloxstrike.net/items/bloxstrike-live/106466951136790.png' },
  { id: 'skin_207_mac_10_midas', name: 'MAC-10 | Midas', weapon: 'SMG', rarity: 'covert', wear: 'Field-Tested', price: 35, image: 'https://bloxstrike.net/items/bloxstrike-live/100609608112786.png' },
  { id: 'skin_208_ak_47_aniki', name: 'AK-47 | Aniki', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 30, image: 'https://bloxstrike.net/items/bloxstrike-live/83000635050744.png' },
  { id: 'skin_209_desert_eagle_racer8', name: 'Desert Eagle | Racer8', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 27, image: 'https://bloxstrike.net/items/bloxstrike-live/116218659152633.png' },
  { id: 'skin_210_dual_berettas_choking_hazard', name: 'Dual Berettas | Choking Hazard', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 24, image: 'https://bloxstrike.net/items/bloxstrike-live/107389695920030.png' },
  { id: 'skin_211_m4a4_wrapped', name: 'M4A4 | Wrapped', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 21, image: 'https://bloxstrike.net/items/bloxstrike-live/125643348750553.png' },
  { id: 'skin_212_five_seven_mk_ii', name: 'Five-SeveN | Mk II', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 18, image: 'https://bloxstrike.net/items/bloxstrike-live/93484299380499.png' },
  { id: 'skin_213_galil_ar_monochrome', name: 'Galil AR | Monochrome', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 18, image: 'https://bloxstrike.net/items/bloxstrike-live/130738743524733.png' },
  { id: 'skin_214_ssg_08_racer8', name: 'SSG 08 | Racer8', weapon: 'AWP', rarity: 'classified', wear: 'Field-Tested', price: 18, image: 'https://bloxstrike.net/items/bloxstrike-live/72651128554373.png' },
  { id: 'skin_215_desert_eagle_circuit', name: 'Desert Eagle | Circuit', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 16, image: 'https://bloxstrike.net/items/bloxstrike-live/96711237869835.png' },
  { id: 'skin_216_dual_berettas_inked', name: 'Dual Berettas | Inked', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 11, image: 'https://bloxstrike.net/items/bloxstrike-live/100406553018004.png' },
  { id: 'skin_217_five_seven_x_ray', name: 'Five-SeveN | X-Ray', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 10, image: 'https://bloxstrike.net/items/bloxstrike-live/117920971198120.png' },
  { id: 'skin_218_glock_18_fuji', name: 'Glock-18 | Fuji', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 15, image: 'https://bloxstrike.net/items/bloxstrike-live/129437922121163.png' },
  { id: 'skin_219_sg_553_dynasty', name: 'SG 553 | Dynasty', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 8, image: 'https://bloxstrike.net/items/bloxstrike-live/104894297920788.png' },
  { id: 'skin_220_sg_553_frostline', name: 'SG 553 | Frostline', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 8, image: 'https://bloxstrike.net/items/bloxstrike-live/107041781535861.png' },
  { id: 'skin_221_five_seven_icecap', name: 'Five-SeveN | Icecap', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/136238530759469.png' },
  { id: 'skin_222_mp9_choke_oil', name: 'MP9 | Choke Oil', weapon: 'SMG', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/112442261177271.png' },
  { id: 'skin_223_p250_mindspill', name: 'P250 | Mindspill', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/120468688778662.png' },
  { id: 'skin_224_p90_synthwave', name: 'P90 | Synthwave', weapon: 'SMG', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/137570525227698.png' },
  { id: 'skin_225_sawed_off_improvised', name: 'Sawed-Off | Improvised', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/119038154277165.png' },
  { id: 'skin_226_xm1014_office', name: 'XM1014 | Office', weapon: 'Rifle', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/137653438110642.png' },
  { id: 'skin_227_zeus_x27_overcharge', name: 'Zeus x27 | Overcharge', weapon: 'Pistol', rarity: 'classified', wear: 'Field-Tested', price: 7, image: 'https://bloxstrike.net/items/bloxstrike-live/74777043312975.png' },
  { id: 'skin_228_dual_berettas_gilded', name: 'Dual Berettas | Gilded', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 4, image: 'https://bloxstrike.net/items/bloxstrike-live/128596252710922.png' },
  { id: 'skin_229_p250_glacial', name: 'P250 | Glacial', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 4, image: 'https://bloxstrike.net/items/bloxstrike-live/116484949047326.png' },
  { id: 'skin_230_zeus_x27_bitfyre', name: 'Zeus x27 | BitFyre', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 3, image: 'https://bloxstrike.net/items/bloxstrike-live/99110361398481.png' },
  { id: 'skin_231_desert_eagle_paranoia', name: 'Desert Eagle | Paranoia', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 2, image: 'https://bloxstrike.net/items/bloxstrike-live/80741450678165.png' },
  { id: 'skin_232_five_seven_control', name: 'Five-SeveN | Control', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 2, image: 'https://bloxstrike.net/items/bloxstrike-live/134074624196032.png' },
  { id: 'skin_233_ak_47_red_baron', name: 'AK-47 | Red Baron', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/101540917675426.png' },
  { id: 'skin_234_aug_hot_rod', name: 'AUG | Hot Rod', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/111356995885809.png' },
  { id: 'skin_235_aug_overgrowth', name: 'AUG | Overgrowth', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/140091348241279.png' },
  { id: 'skin_236_aug_predator', name: 'AUG | Predator', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/137513500264636.png' },
  { id: 'skin_237_aug_tension', name: 'AUG | Tension', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/115462193206399.png' },
  { id: 'skin_238_desert_eagle_spectrum', name: 'Desert Eagle | Spectrum', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/115909642433750.png' },
  { id: 'skin_239_desert_eagle_turbo', name: 'Desert Eagle | Turbo', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/138525436277720.png' },
  { id: 'skin_240_desert_eagle_velocity', name: 'Desert Eagle | Velocity', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/99871777586907.png' },
  { id: 'skin_241_dual_berettas_overclock', name: 'Dual Berettas | Overclock', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/122112952414992.png' },
  { id: 'skin_242_dual_berettas_tension', name: 'Dual Berettas | Tension', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/114332654530188.png' },
  { id: 'skin_243_dual_berettas_vernal', name: 'Dual Berettas | Vernal', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/74510397280714.png' },
  { id: 'skin_244_famas_arctic_camo', name: 'FAMAS | Arctic Camo', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/90069607553613.png' },
  { id: 'skin_245_famas_medic', name: 'FAMAS | Medic', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/93020935624507.png' },
  { id: 'skin_246_famas_wallpaper', name: 'FAMAS | Wallpaper', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/120439847405332.png' },
  { id: 'skin_247_galil_ar_feral', name: 'Galil AR | Feral', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/100237896129409.png' },
  { id: 'skin_248_galil_ar_irradiated', name: 'Galil AR | Irradiated', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/106417126259183.png' },
  { id: 'skin_249_galil_ar_limewire', name: 'Galil AR | Limewire', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/77282765150348.png' },
  { id: 'skin_250_glock_18_broken_tv', name: 'Glock-18 | Broken Tv', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/139806341142620.png' },
  { id: 'skin_251_m4a1_s_blackops', name: 'M4A1-S | BlackOps', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/95735308676498.png' },
  { id: 'skin_252_mac_10_daisies', name: 'MAC-10 | Daisies', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/96061304037175.png' },
  { id: 'skin_253_mac_10_ivory', name: 'MAC-10 | Ivory', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/72375282773597.png' },
  { id: 'skin_254_mac_10_nailgun', name: 'MAC-10 | Nailgun', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/98375349370592.png' },
  { id: 'skin_255_mac_10_ngram', name: 'MAC-10 | NGRAM', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/125861412921368.png' },
  { id: 'skin_256_mag_7_vision7', name: 'MAG-7 | Vision7', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/84172197270302.png' },
  { id: 'skin_257_mp9_canyon', name: 'MP9 | Canyon', weapon: 'SMG', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/99598867872286.png' },
  { id: 'skin_258_mp9_classified', name: 'MP9 | Classified', weapon: 'SMG', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/75959435584717.png' },
  { id: 'skin_259_mp9_graffiti', name: 'MP9 | Graffiti', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/115242436485830.png' },
  { id: 'skin_260_mp9_paranoia', name: 'MP9 | Paranoia', weapon: 'SMG', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/97054421713962.png' },
  { id: 'skin_261_negev_noctiflora', name: 'Negev | Noctiflora', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/83754236144122.png' },
  { id: 'skin_262_negev_rotary_power', name: 'Negev | Rotary Power', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/127898945501092.png' },
  { id: 'skin_263_negev_the_jungle', name: 'Negev | The Jungle', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/111796127103879.png' },
  { id: 'skin_264_nova_flutter', name: 'Nova | Flutter', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/126400338463515.png' },
  { id: 'skin_265_nova_half_one', name: 'Nova | Half+One', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/70430062045206.png' },
  { id: 'skin_266_nova_heat', name: 'Nova | Heat', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/113698208856050.png' },
  { id: 'skin_267_nova_slime', name: 'Nova | Slime', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/132890619125059.png' },
  { id: 'skin_268_p250_b_250', name: 'P250 | B-250', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/85086661556319.png' },
  { id: 'skin_269_p250_frutiger_aero', name: 'P250 | Frutiger Aero', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/77073254515432.png' },
  { id: 'skin_270_p250_pulse', name: 'P250 | Pulse', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/108106875379899.png' },
  { id: 'skin_271_p250_zen', name: 'P250 | Zen', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/126784518790646.png' },
  { id: 'skin_272_p90_big_cat', name: 'P90 | Big Cat', weapon: 'SMG', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/91697533492652.png' },
  { id: 'skin_273_p90_database', name: 'P90 | Database', weapon: 'SMG', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/119190324464014.png' },
  { id: 'skin_274_r8_revolver_bloody8', name: 'R8 Revolver | Bloody8', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/107191191045067.png' },
  { id: 'skin_275_r8_revolver_warui', name: 'R8 Revolver | Warui', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/86336064116706.png' },
  { id: 'skin_276_sawed_off_panthera', name: 'Sawed-Off | Panthera', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/118932565285228.png' },
  { id: 'skin_277_sg_553_cryo', name: 'SG 553 | Cryo', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/90539545081878.png' },
  { id: 'skin_278_ssg_08_desert_strike', name: 'SSG 08 | Desert Strike', weapon: 'AWP', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/74118799794382.png' },
  { id: 'skin_279_ssg_08_labyrinth', name: 'SSG 08 | Labyrinth', weapon: 'AWP', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/103089015904236.png' },
  { id: 'skin_280_tec_9_monarch', name: 'Tec-9 | Monarch', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/138177756309876.png' },
  { id: 'skin_281_tec_9_striker', name: 'Tec-9 | Striker', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/136793807710225.png' },
  { id: 'skin_282_tec_9_timeless', name: 'Tec-9 | Timeless', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/84194710883435.png' },
  { id: 'skin_283_tec_9_trajectory', name: 'Tec-9 | Trajectory', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/139338962898457.png' },
  { id: 'skin_284_tec_9_vice', name: 'Tec-9 | Vice', weapon: 'Pistol', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/93271507640385.png' },
  { id: 'skin_285_usp_s_heated', name: 'USP-S | Heated', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/109389222580238.png' },
  { id: 'skin_286_usp_s_specops', name: 'USP-S | SpecOps', weapon: 'Pistol', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/118258124480427.png' },
  { id: 'skin_287_xm1014_abstract', name: 'XM1014 | Abstract', weapon: 'Rifle', rarity: 'restricted', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/97869926504409.png' },
  { id: 'skin_288_xm1014_koi', name: 'XM1014 | Koi', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/131064385117152.png' },
  { id: 'skin_289_xm1014_lilies', name: 'XM1014 | Lilies', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/81875167939536.png' },
  { id: 'skin_290_xm1014_splatter', name: 'XM1014 | Splatter', weapon: 'Rifle', rarity: 'milspec', wear: 'Field-Tested', price: 1, image: 'https://bloxstrike.net/items/bloxstrike-live/136361774676153.png' },
];

export const STARTER_INVENTORY: Skin[] = [];
export const TARGET_POOL: Skin[] = SKIN_CATALOG;
export const INVENTORY: Skin[] = [];
export const ALL_SKINS_CATALOG: Skin[] = SKIN_CATALOG;

const skinImageByName = new Map(SKIN_CATALOG.map(s => [s.name, s.image]));
const skinByName = new Map(SKIN_CATALOG.map(s => [s.name, s]));
const skinById = new Map(SKIN_CATALOG.map(s => [s.id, s]));

export function findSkinById(id: string): Skin | undefined {
  return skinById.get(id);
}

/** Resolve catalog skin from a display name (feed rows, legacy aliases). */
export function findSkinByName(name: string): Skin | undefined {
  const exact = skinByName.get(name);
  if (exact) return exact;

  const lower = name.toLowerCase();
  const caseInsensitive = SKIN_CATALOG.find(s => s.name.toLowerCase() === lower);
  if (caseInsensitive) return caseInsensitive;

  const skinPart = lower.split('|').pop()?.trim();
  if (skinPart) {
    return SKIN_CATALOG.find(s => s.name.toLowerCase().includes(skinPart));
  }

  return undefined;
}

/** Resolve catalog image URL from a skin display name (legacy feed rows). */
export function findSkinImageByName(name: string): string | undefined {
  const exact = skinImageByName.get(name);
  if (exact) return exact;

  const lower = name.toLowerCase();
  const caseInsensitive = SKIN_CATALOG.find(s => s.name.toLowerCase() === lower);
  if (caseInsensitive) return caseInsensitive.image;

  const skinPart = lower.split('|').pop()?.trim();
  if (skinPart) {
    const bySkinPart = SKIN_CATALOG.find(s => s.name.toLowerCase().includes(skinPart));
    if (bySkinPart) return bySkinPart.image;
  }

  return undefined;
}

export const FEED_USERS = [
  'NeonPulse', 'xKiller99', 'VortexAce', 'CyberWolf', 'BladeRunner',
  'GhostOps', 'TitanSlayer', 'NovaStrike', 'IronFist', 'DarkMatter',
];

export const USER = {
  username: 'ShadowViper',
  balance: 2847.5,
  inventoryValue: 12450,
};
