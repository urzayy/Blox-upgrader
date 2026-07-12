let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

const MASTER_VOL = 0.96;
const VOL = 1.6;
const ROLL_SOUND_SRC = '/0710.MP3';
const ROLL_SOUND_VOL = 0.9;
const COMMON_DROP_SOUND_SRC = '/Audio%20common.MP3';
const COMMON_DROP_SOUND_VOL = 0.92;
const MID_DROP_SOUND_SRC = '/5%25.MP3';
const MID_DROP_SOUND_VOL = 0.92;
const ROYAL_LAND_SOUND_SRC = '/RoyalSound.MP3';
const ROYAL_LAND_SOUND_VOL = 0.95;
const ROYAL_ROLL_SOUND_SRC = '/ROYAL%20ROLL.MP3';
const ROYAL_ROLL_SOUND_VOL = 0.9;
const BATTLE_FINISHED_SOUND_SRC = '/BattleFinished.MP3';
const BATTLE_FINISHED_SOUND_VOL = 0.95;

let rollAudio: HTMLAudioElement | null = null;
let commonDropAudio: HTMLAudioElement | null = null;
let midDropAudio: HTMLAudioElement | null = null;
let royalLandAudio: HTMLAudioElement | null = null;
let royalRollAudio: HTMLAudioElement | null = null;
let battleFinishedAudio: HTMLAudioElement | null = null;
let rollFadeTimer: ReturnType<typeof setTimeout> | null = null;
let royalRollFadeTimer: ReturnType<typeof setTimeout> | null = null;
const ROLL_BASE_VOLUME = ROLL_SOUND_VOL * MASTER_VOL;
const ROYAL_ROLL_BASE_VOLUME = ROYAL_ROLL_SOUND_VOL * MASTER_VOL;
const TURBO_ROLL_PLAYBACK_RATE = 2;

function getRollAudio() {
  if (!rollAudio) {
    rollAudio = new Audio(ROLL_SOUND_SRC);
    rollAudio.preload = 'auto';
    rollAudio.volume = ROLL_BASE_VOLUME;
  }
  return rollAudio;
}

function clearRollFade() {
  if (rollFadeTimer) {
    clearTimeout(rollFadeTimer);
    rollFadeTimer = null;
  }
}

function playRollSample(turbo = false) {
  try {
    stopRoyalRollSample();
    clearRollFade();
    const audio = getRollAudio();
    audio.loop = false;
    audio.volume = ROLL_BASE_VOLUME;
    audio.playbackRate = turbo ? TURBO_ROLL_PLAYBACK_RATE : 1;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

function stopRollSample() {
  try {
    if (!rollAudio) return;
    clearRollFade();
    const audio = rollAudio;
    audio.loop = false;

    if (audio.paused) {
      audio.playbackRate = 1;
      return;
    }

    const startVol = audio.volume;
    let step = 0;
    const fadeSteps = 6;

    const fade = () => {
      step += 1;
      audio.volume = startVol * Math.max(0, 1 - step / fadeSteps);
      if (step < fadeSteps) {
        rollFadeTimer = setTimeout(fade, 18);
        return;
      }
      audio.pause();
      audio.volume = ROLL_BASE_VOLUME;
      audio.playbackRate = 1;
      rollFadeTimer = null;
    };

    fade();
  } catch { /* noop */ }
}

function getRoyalRollAudio() {
  if (!royalRollAudio) {
    royalRollAudio = new Audio(ROYAL_ROLL_SOUND_SRC);
    royalRollAudio.preload = 'auto';
    royalRollAudio.volume = ROYAL_ROLL_BASE_VOLUME;
  }
  return royalRollAudio;
}

function clearRoyalRollFade() {
  if (royalRollFadeTimer) {
    clearTimeout(royalRollFadeTimer);
    royalRollFadeTimer = null;
  }
}

function playRoyalRollSample(turbo = false) {
  try {
    stopRollSample();
    clearRoyalRollFade();
    const audio = getRoyalRollAudio();
    audio.loop = false;
    audio.volume = ROYAL_ROLL_BASE_VOLUME;
    audio.playbackRate = turbo ? TURBO_ROLL_PLAYBACK_RATE : 1;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

function stopRoyalRollSample() {
  try {
    if (!royalRollAudio) return;
    clearRoyalRollFade();
    const audio = royalRollAudio;
    audio.loop = false;

    if (audio.paused) {
      audio.playbackRate = 1;
      return;
    }

    const startVol = audio.volume;
    let step = 0;
    const fadeSteps = 6;

    const fade = () => {
      step += 1;
      audio.volume = startVol * Math.max(0, 1 - step / fadeSteps);
      if (step < fadeSteps) {
        royalRollFadeTimer = setTimeout(fade, 18);
        return;
      }
      audio.pause();
      audio.volume = ROYAL_ROLL_BASE_VOLUME;
      audio.playbackRate = 1;
      royalRollFadeTimer = null;
    };

    fade();
  } catch { /* noop */ }
}

function getCommonDropAudio() {
  if (!commonDropAudio) {
    commonDropAudio = new Audio(COMMON_DROP_SOUND_SRC);
    commonDropAudio.preload = 'auto';
    commonDropAudio.volume = COMMON_DROP_SOUND_VOL * MASTER_VOL;
  }
  return commonDropAudio;
}

function playCommonDropSample() {
  try {
    const audio = getCommonDropAudio();
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

function getMidDropAudio() {
  if (!midDropAudio) {
    midDropAudio = new Audio(MID_DROP_SOUND_SRC);
    midDropAudio.preload = 'auto';
    midDropAudio.volume = MID_DROP_SOUND_VOL * MASTER_VOL;
  }
  return midDropAudio;
}

function playMidDropSample() {
  try {
    const audio = getMidDropAudio();
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

function getRoyalLandAudio() {
  if (!royalLandAudio) {
    royalLandAudio = new Audio(ROYAL_LAND_SOUND_SRC);
    royalLandAudio.preload = 'auto';
    royalLandAudio.volume = ROYAL_LAND_SOUND_VOL * MASTER_VOL;
  }
  return royalLandAudio;
}

function playRoyalLandSample() {
  try {
    const audio = getRoyalLandAudio();
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

function getBattleFinishedAudio() {
  if (!battleFinishedAudio) {
    battleFinishedAudio = new Audio(BATTLE_FINISHED_SOUND_SRC);
    battleFinishedAudio.preload = 'auto';
    battleFinishedAudio.volume = BATTLE_FINISHED_SOUND_VOL * MASTER_VOL;
  }
  return battleFinishedAudio;
}

function playBattleFinishedSample() {
  try {
    const audio = getBattleFinishedAudio();
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch { /* noop */ }
}

export function preloadRollSound() {
  try {
    getRollAudio().load();
    getRoyalRollAudio().load();
    getCommonDropAudio().load();
    getMidDropAudio().load();
    getRoyalLandAudio().load();
    getBattleFinishedAudio().load();
  } catch { /* noop */ }
}

function ac() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function out() {
  const c = ac();
  if (!masterGain) {
    masterGain = c.createGain();
    masterGain.gain.value = MASTER_VOL;
    masterGain.connect(c.destination);
  }
  return masterGain;
}

function punchTone(
  freq: number,
  dur: number,
  vol: number,
  when = 0,
  type: OscillatorType = 'sine',
  lpHz = 5200,
) {
  try {
    const c = ac();
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = lpHz;

    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(out());
    o.start(t);
    o.stop(t + dur + 0.05);
  } catch { /* noop */ }
}

function clickPop(vol: number, when = 0, bright = 2200) {
  try {
    const c = ac();
    const t = c.currentTime + when;
    const dur = 0.018;
    const len = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, len, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let n = 0; n < len; n++) {
      const env = Math.pow(1 - n / len, 1.8);
      data[n] = (Math.random() * 2 - 1) * env;
    }
    const noise = c.createBufferSource();
    noise.buffer = buffer;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = bright;
    bp.Q.value = 1.4;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noise.connect(bp);
    bp.connect(g);
    g.connect(out());
    noise.start(t);
    noise.stop(t + dur);
  } catch { /* noop */ }
}

/** Minimal muted peg — fixed pitch, no sweep, short decay. */
function wheelTick(intensity: number) {
  try {
    const c = ac();
    const t = c.currentTime;
    const i = Math.max(0, Math.min(1, intensity));
    const vol = (0.04 + i * 0.05) * VOL;
    const dur = 0.012;

    const o = c.createOscillator();
    const g = c.createGain();
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 680;

    o.type = 'sine';
    o.frequency.setValueAtTime(260 + i * 70, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(lp);
    lp.connect(g);
    g.connect(out());
    o.start(t);
    o.stop(t + dur + 0.02);
  } catch { /* noop */ }
}

type UpgradeTone = {
  freq: number;
  dur: number;
  vol: number;
  when: number;
  type?: OscillatorType;
  lpHz?: number;
};

type UpgradeStartPreset = {
  tones: UpgradeTone[];
  click?: { vol: number; when: number; bright?: number };
};

const UPGRADE_START_PRESETS: UpgradeStartPreset[] = [
  {
    tones: [
      { freq: 220, dur: 0.08, vol: 0.14 * VOL, when: 0, type: 'sine', lpHz: 3000 },
      { freq: 440, dur: 0.1, vol: 0.16 * VOL, when: 0.04, type: 'triangle', lpHz: 5000 },
      { freq: 880, dur: 0.12, vol: 0.14 * VOL, when: 0.08, type: 'sine', lpHz: 6500 },
    ],
    click: { vol: 0.12 * VOL, when: 0.06, bright: 3400 },
  },
  {
    tones: [
      { freq: 165, dur: 0.1, vol: 0.16 * VOL, when: 0, type: 'sine', lpHz: 2200 },
      { freq: 330, dur: 0.11, vol: 0.15 * VOL, when: 0.05, type: 'triangle', lpHz: 4000 },
      { freq: 494, dur: 0.13, vol: 0.13 * VOL, when: 0.1, type: 'sine', lpHz: 5500 },
    ],
    click: { vol: 0.1 * VOL, when: 0.08, bright: 2800 },
  },
  {
    tones: [
      { freq: 392, dur: 0.07, vol: 0.15 * VOL, when: 0, type: 'triangle', lpHz: 5000 },
      { freq: 587, dur: 0.08, vol: 0.14 * VOL, when: 0.035, type: 'sine', lpHz: 6200 },
      { freq: 784, dur: 0.1, vol: 0.13 * VOL, when: 0.07, type: 'triangle', lpHz: 7000 },
    ],
    click: { vol: 0.14 * VOL, when: 0.05, bright: 3800 },
  },
  {
    tones: [
      { freq: 261, dur: 0.09, vol: 0.15 * VOL, when: 0, type: 'square', lpHz: 2800 },
      { freq: 523, dur: 0.1, vol: 0.14 * VOL, when: 0.045, type: 'sine', lpHz: 4800 },
      { freq: 698, dur: 0.11, vol: 0.12 * VOL, when: 0.09, type: 'triangle', lpHz: 6000 },
    ],
    click: { vol: 0.11 * VOL, when: 0.07, bright: 3200 },
  },
  {
    tones: [
      { freq: 196, dur: 0.08, vol: 0.13 * VOL, when: 0, type: 'sine', lpHz: 2600 },
      { freq: 349, dur: 0.09, vol: 0.15 * VOL, when: 0.04, type: 'triangle', lpHz: 4200 },
      { freq: 622, dur: 0.11, vol: 0.16 * VOL, when: 0.085, type: 'sine', lpHz: 5800 },
      { freq: 932, dur: 0.09, vol: 0.12 * VOL, when: 0.13, type: 'sine', lpHz: 6800 },
    ],
    click: { vol: 0.13 * VOL, when: 0.1, bright: 3600 },
  },
];

function playUpgradeStartPreset(preset: UpgradeStartPreset, turbo = false) {
  const speed = turbo ? 0.85 : 1;
  const volScale = turbo ? 1.08 : 1;

  for (const tone of preset.tones) {
    punchTone(
      tone.freq,
      tone.dur * speed,
      tone.vol * volScale,
      tone.when * speed,
      tone.type ?? 'sine',
      tone.lpHz ?? 5200,
    );
  }

  if (preset.click) {
    clickPop(
      preset.click.vol * volScale,
      preset.click.when * speed,
      preset.click.bright ?? 3200,
    );
  }
}

function upgradeWheelLand() {
  const landFreq = 85 + Math.random() * 30;
  punchTone(landFreq, 0.1, 0.1 * VOL, 0, 'sine', 750);
}

function caseWheelLand(options?: { keepRoyalRoll?: boolean }) {
  stopRollSample();
  if (!options?.keepRoyalRoll) stopRoyalRollSample();
}

function wheelLand(options?: { keepRoyalRoll?: boolean }) {
  if (options) {
    caseWheelLand(options);
    return;
  }
  upgradeWheelLand();
}

function upgradeStart(turbo = false) {
  const preset = UPGRADE_START_PRESETS[Math.floor(Math.random() * UPGRADE_START_PRESETS.length)];
  playUpgradeStartPreset(preset, turbo);
}

function caseRollStart(turbo = false) {
  playRollSample(turbo);
}

function royalRollStart(turbo = false) {
  playRoyalRollSample(turbo);
}

function caseDropCommon() {
  playCommonDropSample();
}

function caseDropMid() {
  playMidDropSample();
}

function royalLand() {
  playRoyalLandSample();
}

function battleFinished() {
  playBattleFinishedSample();
}

function win() {
  const hits = [
    { f: 523.25, w: 0, v: 0.22 * VOL },
    { f: 659.25, w: 0.07, v: 0.2 * VOL },
    { f: 783.99, w: 0.14, v: 0.18 * VOL },
    { f: 1046.5, w: 0.21, v: 0.17 * VOL },
    { f: 1318.5, w: 0.3, v: 0.16 * VOL },
    { f: 1567.98, w: 0.38, v: 0.14 * VOL },
  ];
  hits.forEach(({ f, w, v }) => punchTone(f, 0.22, v, w, 'triangle', 6500));
  setTimeout(() => clickPop(0.18 * VOL, 0, 3200), 320);
  setTimeout(() => punchTone(2093, 0.35, 0.2 * VOL, 0, 'sine', 7000), 400);
}

function lose() {
  punchTone(349.23, 0.18, 0.16 * VOL, 0, 'triangle', 3000);
  setTimeout(() => punchTone(261.63, 0.22, 0.14 * VOL, 0, 'sine', 2400), 100);
  setTimeout(() => punchTone(196, 0.28, 0.1 * VOL, 0, 'sine', 1800), 220);
  setTimeout(() => clickPop(0.08 * VOL, 0, 600), 280);
}

function select() {
  clickPop(0.2 * VOL, 0, 2800);
  punchTone(587.33, 0.07, 0.2 * VOL, 0.008, 'sine', 6000);
  punchTone(880, 0.09, 0.18 * VOL, 0.025, 'triangle', 6500);
  punchTone(1174.66, 0.12, 0.15 * VOL, 0.05, 'sine', 7000);
}

export const WHEEL_DEG_PER_TICK = 360 / 48;

export const sfx = {
  upgradeStart,
  caseRollStart,
  royalRollStart,
  wheelTick,
  wheelLand,
  caseWheelLand,
  caseDropCommon,
  caseDropMid,
  royalLand,
  battleFinished,
  win,
  lose,
  select,
};

export class WheelSpinAudio {
  private tickAcc = 0;
  private lastAngle = 0;
  private lastTime = 0;
  private maxVel = 700;
  private fastSkip = false;

  reset(startAngle: number) {
    this.tickAcc = 0;
    this.lastAngle = startAngle;
    this.lastTime = performance.now();
    this.maxVel = 700;
    this.fastSkip = false;
  }

  update(angle: number, turbo: boolean) {
    const now = performance.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;

    const delta = Math.abs(angle - this.lastAngle);
    this.lastAngle = angle;
    if (dt <= 0 || delta <= 0) return;

    const degPerSec = delta / dt;
    this.maxVel = Math.max(this.maxVel * 0.992, degPerSec);
    const cap = turbo ? 1800 : Math.max(this.maxVel, 650);
    const norm = Math.min(1, degPerSec / cap);
    const intensity = Math.pow(norm, 0.8);

    this.tickAcc += delta;
    if (this.tickAcc >= WHEEL_DEG_PER_TICK) {
      this.tickAcc %= WHEEL_DEG_PER_TICK;

      if (intensity > 0.55) {
        this.fastSkip = !this.fastSkip;
        if (this.fastSkip) return;
      }

      sfx.wheelTick(intensity);
    }
  }

  finish() {
    sfx.wheelLand();
  }
}
